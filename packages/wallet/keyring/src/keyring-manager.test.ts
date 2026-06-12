import { secp256k1 } from '@noble/curves/secp256k1';
import { generateSeed } from 'ripple-keypairs';
import { describe, expect, it } from 'vitest';
import {
  InvalidMnemonicError,
  InvalidPasscodeError,
  KeyringLockedError,
  UnsupportedChainError,
  VaultCorruptedError,
  WalletNotFoundError,
} from './errors';
import { KeyringManager } from './keyring-manager';
import type { SecureStorage } from './storage';
import { LEGACY_VAULT_STORAGE_KEY, PASSCODE_STORAGE_KEY, VAULT_STORAGE_KEY } from './vault';
import { InvalidFamilySeedError } from './xrpl';

const MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const MNEMONIC_2 = 'legal winner thank year wave sausage worth useful legal winner thank yellow';

const SECP_SEED = generateSeed({
  entropy: Uint8Array.from({ length: 16 }, (_, i) => i + 1),
  algorithm: 'ecdsa-secp256k1',
});
const ED_SEED = generateSeed({
  entropy: Uint8Array.from({ length: 16 }, (_, i) => i + 1),
  algorithm: 'ed25519',
});

const SECRET_NUMBERS_ENTROPY = Uint8Array.from({ length: 16 }, (_, i) => 255 - i);
const SECRET_NUMBERS_ROWS = Array.from({ length: 8 }, (_, i) => {
  const value = (SECRET_NUMBERS_ENTROPY[i * 2] << 8) | SECRET_NUMBERS_ENTROPY[i * 2 + 1];
  return `${String(value).padStart(5, '0')}${(value * (i * 2 + 1)) % 9}`;
});

function memoryStorage(): SecureStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => {
      data.set(key, value);
    },
    remove: async (key) => {
      data.delete(key);
    },
  };
}

async function unlockedKeyring() {
  const storage = memoryStorage();
  const keyring = new KeyringManager(storage);
  await keyring.initialize('123456');
  return { storage, keyring };
}

describe('KeyringManager', () => {
  describe('lifecycle', () => {
    it('initializes, locks and unlocks', async () => {
      const storage = memoryStorage();
      const keyring = new KeyringManager(storage);
      expect(await keyring.isInitialized()).toBe(false);

      await keyring.initialize('123456');
      expect(await keyring.isInitialized()).toBe(true);
      expect(keyring.isUnlocked).toBe(true);
      const wallet = await keyring.importMnemonic(MNEMONIC, 'Main');

      keyring.lock();
      expect(keyring.isUnlocked).toBe(false);

      await keyring.unlock('123456');
      expect(keyring.isUnlocked).toBe(true);
      expect(keyring.getWallets()).toEqual([
        expect.objectContaining({
          id: wallet.id,
          name: 'Main',
          type: 'hd',
          backedUp: true,
        }),
      ]);
    });

    it('refuses to initialize twice', async () => {
      const { storage } = await unlockedKeyring();
      const again = new KeyringManager(storage);
      await expect(again.initialize('999999')).rejects.toThrow(/already initialized/);
    });

    it('rejects a wrong passcode', async () => {
      const { keyring } = await unlockedKeyring();
      keyring.lock();
      await expect(keyring.unlock('654321')).rejects.toThrow(InvalidPasscodeError);
      expect(keyring.isUnlocked).toBe(false);
    });

    it('unlocks across instances sharing storage', async () => {
      const { storage, keyring } = await unlockedKeyring();
      const wallet = await keyring.createWallet({ name: 'Fresh' });

      const second = new KeyringManager(storage);
      await second.unlock('123456');
      expect(second.getWallets()).toEqual([expect.objectContaining({ id: wallet.id })]);
      expect(second.getActiveWallet()?.id).toBe(wallet.id);
    });
  });

  describe('unlock', () => {
    it('opens the same wallets that were created before locking', async () => {
      const { keyring } = await unlockedKeyring();
      const first = await keyring.importMnemonic(MNEMONIC, 'Main');
      const second = await keyring.importFamilySeed(SECP_SEED, 'Cold');
      keyring.lock();

      await keyring.unlock('123456');
      expect(keyring.getWallets()).toEqual([
        expect.objectContaining({ id: first.id, name: 'Main' }),
        expect.objectContaining({ id: second.id, name: 'Cold' }),
      ]);
    });

    it('throws VaultCorruptedError on a corrupted stored vault', async () => {
      const { storage, keyring } = await unlockedKeyring();
      keyring.lock();
      await storage.set(VAULT_STORAGE_KEY, 'not json');
      await expect(keyring.unlock('123456')).rejects.toThrow(VaultCorruptedError);
    });
  });

  describe('unlockTrusted (biometric path)', () => {
    it('re-opens the vault without a passcode', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.createWallet();

      keyring.lock();
      await keyring.unlockTrusted();
      expect(keyring.isUnlocked).toBe(true);
      expect(keyring.getWallets()).toEqual([expect.objectContaining({ id: wallet.id })]);
    });

    it('rejects on an uninitialized keyring', async () => {
      const storage = memoryStorage();
      const keyring = new KeyringManager(storage);
      await expect(keyring.unlockTrusted()).rejects.toThrow();
      expect(keyring.isUnlocked).toBe(false);
    });
  });

  describe('changePasscode', () => {
    it('invalidates the old passcode but leaves secrets untouched', async () => {
      const { keyring } = await unlockedKeyring();
      await keyring.createWallet();

      await keyring.changePasscode('123456', '654321');
      keyring.lock();

      await expect(keyring.unlock('123456')).rejects.toThrow(InvalidPasscodeError);
      await keyring.unlock('654321');
      expect(keyring.getWallets()).toHaveLength(1);

      keyring.lock();
      await keyring.unlockTrusted(); // secrets untouched: the biometric path still opens it
      expect(keyring.getWallets()).toHaveLength(1);
    });

    it('verifies the current passcode', async () => {
      const { keyring } = await unlockedKeyring();
      await expect(keyring.changePasscode('000000', '654321')).rejects.toThrow(
        InvalidPasscodeError,
      );
    });

    it('keeps an unlocked keyring usable after the change', async () => {
      const { keyring } = await unlockedKeyring();
      await keyring.changePasscode('123456', '654321');
      await expect(keyring.createWallet()).resolves.toBeDefined();
      keyring.lock();
      await keyring.unlock('654321');
      expect(keyring.getWallets()).toHaveLength(1);
    });
  });

  describe('v1 → v2 migration', () => {
    it('migrates legacy wallets on initialize and removes the legacy key', async () => {
      const storage = memoryStorage();
      storage.data.set(
        LEGACY_VAULT_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          wallets: [
            { id: 'wallet-1', name: 'Main', type: 'hd', mnemonic: MNEMONIC },
            { id: 'wallet-2', name: 'Spare', type: 'hd', mnemonic: MNEMONIC_2 },
          ],
        }),
      );
      const keyring = new KeyringManager(storage);
      expect(await keyring.hasLegacyVault()).toBe(true);

      await keyring.initialize('123456');
      expect(storage.data.has(LEGACY_VAULT_STORAGE_KEY)).toBe(false);
      expect(await keyring.hasLegacyVault()).toBe(false);

      const wallets = keyring.getWallets();
      expect(wallets).toHaveLength(2);
      expect(wallets[0]).toMatchObject({
        id: 'wallet-1',
        name: 'Main',
        type: 'hd',
        chains: ['xrpl', 'evm'],
        backedUp: true,
      });
      expect(keyring.getActiveWallet()?.id).toBe('wallet-1');
      expect(keyring.exportMnemonic('wallet-2')).toBe(MNEMONIC_2);
    });
  });

  describe('wallet management', () => {
    it('creates wallets with default names and active switching', async () => {
      const { keyring } = await unlockedKeyring();
      expect(keyring.getActiveWallet()).toBeNull();

      const first = await keyring.createWallet();
      expect(first).toMatchObject({
        name: 'Wallet 1',
        type: 'hd',
        chains: ['xrpl', 'evm'],
        backedUp: false,
      });
      expect(keyring.getActiveWallet()?.id).toBe(first.id);

      const second = await keyring.importMnemonic(MNEMONIC);
      expect(second.name).toBe('Wallet 2');
      expect(second.backedUp).toBe(true);
      expect(keyring.getActiveWallet()?.id).toBe(second.id);

      await keyring.setActiveWallet(first.id);
      expect(keyring.getActiveWallet()?.id).toBe(first.id);
    });

    it('creates 12-word mnemonics by default and 24 on request', async () => {
      const { keyring } = await unlockedKeyring();
      const twelve = await keyring.createWallet();
      const twentyFour = await keyring.createWallet({ words: 24 });
      expect(keyring.exportMnemonic(twelve.id).split(' ')).toHaveLength(12);
      expect(keyring.exportMnemonic(twentyFour.id).split(' ')).toHaveLength(24);
    });

    it('renames and marks wallets as backed up', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.createWallet();

      await keyring.renameWallet(wallet.id, 'Savings');
      await keyring.markBackedUp(wallet.id);
      expect(keyring.getWallets()[0]).toMatchObject({
        name: 'Savings',
        backedUp: true,
      });
    });

    it('removes wallets and falls back to the first remaining as active', async () => {
      const { keyring } = await unlockedKeyring();
      const first = await keyring.importMnemonic(MNEMONIC);
      const second = await keyring.importMnemonic(MNEMONIC_2);
      expect(keyring.getActiveWallet()?.id).toBe(second.id);

      await keyring.removeWallet(second.id);
      expect(keyring.getActiveWallet()?.id).toBe(first.id);

      await keyring.removeWallet(first.id);
      expect(keyring.getWallets()).toHaveLength(0);
      expect(keyring.getActiveWallet()).toBeNull();
    });

    it('throws WalletNotFoundError for unknown ids', async () => {
      const { keyring } = await unlockedKeyring();
      expect(() => keyring.exportMnemonic('nope')).toThrow(WalletNotFoundError);
      await expect(keyring.removeWallet('nope')).rejects.toThrow(WalletNotFoundError);
      await expect(keyring.setActiveWallet('nope')).rejects.toThrow(WalletNotFoundError);
    });

    it('rejects invalid and duplicate mnemonics', async () => {
      const { keyring } = await unlockedKeyring();
      await expect(keyring.importMnemonic('not a valid phrase')).rejects.toThrow(
        InvalidMnemonicError,
      );
      await keyring.importMnemonic(MNEMONIC);
      await expect(keyring.importMnemonic(`  ${MNEMONIC.toUpperCase()} `)).rejects.toThrow(
        /already exists/,
      );
    });

    it('normalizes whitespace and casing on mnemonic import', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.importMnemonic(
        `  ${MNEMONIC.toUpperCase().replace(/ /g, '   ')} `,
      );
      expect(keyring.exportMnemonic(wallet.id)).toBe(MNEMONIC);
    });
  });

  describe('XRPL imports', () => {
    it('imports a family seed as an xrpl-only wallet', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.importFamilySeed(SECP_SEED, 'Cold');
      expect(wallet).toMatchObject({
        name: 'Cold',
        type: 'xrpl-seed',
        chains: ['xrpl'],
        backedUp: true,
      });
      expect(keyring.getActiveWallet()?.id).toBe(wallet.id);
      expect(keyring.exportFamilySeed(wallet.id)).toBe(SECP_SEED);
      expect(() => keyring.exportMnemonic(wallet.id)).toThrow(UnsupportedChainError);
    });

    it('rejects invalid and duplicate family seeds', async () => {
      const { keyring } = await unlockedKeyring();
      await expect(keyring.importFamilySeed('garbage')).rejects.toThrow(InvalidFamilySeedError);
      await keyring.importFamilySeed(SECP_SEED);
      await expect(keyring.importFamilySeed(SECP_SEED)).rejects.toThrow(/already exists/);
    });

    it('imports secret numbers as the family seed they encode', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.importSecretNumbers(SECRET_NUMBERS_ROWS);
      expect(wallet.type).toBe('xrpl-seed');
      expect(keyring.exportFamilySeed(wallet.id)).toBe(
        generateSeed({
          entropy: SECRET_NUMBERS_ENTROPY,
          algorithm: 'ecdsa-secp256k1',
        }),
      );
      expect(keyring.getSigner(wallet.id, 'xrpl').curve).toBe('secp256k1');
    });

    it('refuses to export a family seed from an hd wallet', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.importMnemonic(MNEMONIC);
      expect(() => keyring.exportFamilySeed(wallet.id)).toThrow(UnsupportedChainError);
    });
  });

  describe('getSigner', () => {
    it('derives deterministic secp256k1 signers per chain for hd wallets', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.importMnemonic(MNEMONIC);

      const xrpl = keyring.getSigner(wallet.id, 'xrpl');
      const evm = keyring.getSigner(wallet.id, 'evm');
      expect(xrpl.curve).toBe('secp256k1');
      expect(xrpl.publicKey).toHaveLength(33);
      expect(evm.publicKey).toHaveLength(33);
      expect(xrpl.publicKey).not.toEqual(evm.publicKey);
      expect(keyring.getSigner(wallet.id, 'xrpl').publicKey).toEqual(xrpl.publicKey);
      expect(keyring.getSigner(wallet.id, 'xrpl', 1).publicKey).not.toEqual(xrpl.publicKey);
    });

    it('produces signatures that verify against the public key', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.importMnemonic(MNEMONIC);
      const signer = keyring.getSigner(wallet.id, 'xrpl');

      const digest = new Uint8Array(32).fill(7);
      const { signature, recovery } = await signer.signDigest(digest);
      expect(signature).toHaveLength(64);
      expect([0, 1]).toContain(recovery);
      expect(secp256k1.verify(signature, digest, signer.publicKey)).toBe(true);
    });

    it('returns an ed25519 signer for sEd family seeds', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.importFamilySeed(ED_SEED);
      const signer = keyring.getSigner(wallet.id, 'xrpl');
      expect(signer.curve).toBe('ed25519');
      expect(signer.publicKey).toHaveLength(32);
    });

    it('refuses non-xrpl chains for family-seed wallets', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.importFamilySeed(SECP_SEED);
      expect(() => keyring.getSigner(wallet.id, 'evm')).toThrow(UnsupportedChainError);
    });
  });

  describe('locking', () => {
    it('throws KeyringLockedError for every wallet op while locked', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.createWallet();
      keyring.lock();

      expect(() => keyring.getWallets()).toThrow(KeyringLockedError);
      expect(() => keyring.getActiveWallet()).toThrow(KeyringLockedError);
      expect(() => keyring.exportMnemonic(wallet.id)).toThrow(KeyringLockedError);
      expect(() => keyring.exportFamilySeed(wallet.id)).toThrow(KeyringLockedError);
      expect(() => keyring.getSigner(wallet.id, 'xrpl')).toThrow(KeyringLockedError);
      await expect(keyring.setActiveWallet(wallet.id)).rejects.toThrow(KeyringLockedError);
      await expect(keyring.createWallet()).rejects.toThrow(KeyringLockedError);
      await expect(keyring.importMnemonic(MNEMONIC)).rejects.toThrow(KeyringLockedError);
      await expect(keyring.importFamilySeed(SECP_SEED)).rejects.toThrow(KeyringLockedError);
      await expect(keyring.importSecretNumbers(SECRET_NUMBERS_ROWS)).rejects.toThrow(
        KeyringLockedError,
      );
      await expect(keyring.renameWallet(wallet.id, 'X')).rejects.toThrow(KeyringLockedError);
      await expect(keyring.removeWallet(wallet.id)).rejects.toThrow(KeyringLockedError);
      await expect(keyring.markBackedUp(wallet.id)).rejects.toThrow(KeyringLockedError);
    });
  });

  describe('reset', () => {
    it('removes both vaults from storage and locks', async () => {
      const storage = memoryStorage();
      storage.data.set(LEGACY_VAULT_STORAGE_KEY, JSON.stringify({ version: 1, wallets: [] }));
      const keyring = new KeyringManager(storage);
      await keyring.initialize('123456');
      await keyring.createWallet();

      await keyring.reset();
      expect(storage.data.size).toBe(0);
      expect(keyring.isUnlocked).toBe(false);
      expect(await keyring.isInitialized()).toBe(false);
    });
  });

  describe('storage format', () => {
    it('persists a plaintext v2 vault under the v2 key', async () => {
      const { storage, keyring } = await unlockedKeyring();
      await keyring.importMnemonic(MNEMONIC);
      await keyring.importFamilySeed(SECP_SEED);

      const raw = storage.data.get(VAULT_STORAGE_KEY);
      expect(raw).toBeDefined();
      // Secrets live as plaintext: the secure store is the protection boundary.
      expect(raw).toContain('abandon');
      expect(raw).toContain(SECP_SEED);

      const vault = JSON.parse(raw as string);
      expect(vault).toMatchObject({ version: 2 });
      expect(vault.wallets).toHaveLength(2);
    });

    it('keeps the passcode out of the stored verifier', async () => {
      const { storage } = await unlockedKeyring();
      const verifier = storage.data.get(PASSCODE_STORAGE_KEY);
      expect(verifier).toBeDefined();
      expect(verifier).not.toContain('123456');
    });
  });
});
