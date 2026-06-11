import { secp256k1 } from '@noble/curves/secp256k1';
import { randomBytes } from '@noble/hashes/utils';
import { generateSeed } from 'ripple-keypairs';
import { describe, expect, it } from 'vitest';
import {
  InvalidMnemonicError,
  InvalidPasscodeError,
  KeyringLockedError,
  UnsupportedChainError,
  WalletNotFoundError,
} from './errors';
import { KeyringManager } from './keyring-manager';
import type { SecureStorage } from './storage';
import type { KdfParams } from './vault';
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

const KDF: KdfParams = { n: 1024, r: 8, p: 1 };

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
  const keyring = new KeyringManager(storage, KDF);
  await keyring.initialize('123456');
  return { storage, keyring };
}

describe('KeyringManager', () => {
  describe('lifecycle', () => {
    it('initializes, locks and unlocks', async () => {
      const storage = memoryStorage();
      const keyring = new KeyringManager(storage, KDF);
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
      const again = new KeyringManager(storage, KDF);
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

      const second = new KeyringManager(storage, KDF);
      await second.unlock('123456');
      expect(second.getWallets()).toEqual([expect.objectContaining({ id: wallet.id })]);
      expect(second.getActiveWallet()?.id).toBe(wallet.id);
    });
  });

  describe('vault key (biometric path)', () => {
    it('unlockWithKey works with the key from getVaultKey', async () => {
      const { keyring } = await unlockedKeyring();
      const wallet = await keyring.createWallet();
      const vaultKey = keyring.getVaultKey();

      keyring.lock();
      await keyring.unlockWithKey(vaultKey);
      expect(keyring.getWallets()).toEqual([expect.objectContaining({ id: wallet.id })]);
    });

    it('getVaultKey returns a defensive copy', async () => {
      const { keyring } = await unlockedKeyring();
      await keyring.createWallet();
      const copy = keyring.getVaultKey();
      copy.fill(0);
      // The manager's own key is untouched: persisting and unlocking still work.
      await expect(keyring.createWallet()).resolves.toBeDefined();
      const intact = keyring.getVaultKey();
      keyring.lock();
      await keyring.unlockWithKey(intact);
      expect(keyring.getWallets()).toHaveLength(2);
    });

    it('unlockWithKey keeps its own copy of the key', async () => {
      const { keyring } = await unlockedKeyring();
      await keyring.createWallet();
      const vaultKey = keyring.getVaultKey();
      keyring.lock();
      await keyring.unlockWithKey(vaultKey);
      vaultKey.fill(0); // caller wipes its copy; the keyring must keep working
      await expect(keyring.createWallet()).resolves.toBeDefined();
    });

    it('rejects a wrong vault key', async () => {
      const { keyring } = await unlockedKeyring();
      keyring.lock();
      await expect(keyring.unlockWithKey(randomBytes(32))).rejects.toThrow(InvalidPasscodeError);
    });
  });

  describe('changePasscode', () => {
    it('invalidates the old passcode but keeps the vault key', async () => {
      const { keyring } = await unlockedKeyring();
      await keyring.createWallet();
      const vaultKey = keyring.getVaultKey();

      await keyring.changePasscode('123456', '654321');
      keyring.lock();

      await expect(keyring.unlock('123456')).rejects.toThrow(InvalidPasscodeError);
      await keyring.unlock('654321');
      expect(keyring.getWallets()).toHaveLength(1);

      keyring.lock();
      await keyring.unlockWithKey(vaultKey); // same vault key still opens the data blob
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
        'flama.wallet.vault',
        JSON.stringify({
          version: 1,
          wallets: [
            { id: 'wallet-1', name: 'Main', type: 'hd', mnemonic: MNEMONIC },
            { id: 'wallet-2', name: 'Spare', type: 'hd', mnemonic: MNEMONIC_2 },
          ],
        }),
      );
      const keyring = new KeyringManager(storage, KDF);
      expect(await keyring.hasLegacyVault()).toBe(true);

      await keyring.initialize('123456');
      expect(storage.data.has('flama.wallet.vault')).toBe(false);
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
      expect(() => keyring.getVaultKey()).toThrow(KeyringLockedError);
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
      storage.data.set('flama.wallet.vault', JSON.stringify({ version: 1, wallets: [] }));
      const keyring = new KeyringManager(storage, KDF);
      await keyring.initialize('123456');
      await keyring.createWallet();

      await keyring.reset();
      expect(storage.data.size).toBe(0);
      expect(keyring.isUnlocked).toBe(false);
      expect(await keyring.isInitialized()).toBe(false);
    });
  });

  describe('storage format', () => {
    it('never persists secrets in plaintext', async () => {
      const { storage, keyring } = await unlockedKeyring();
      await keyring.importMnemonic(MNEMONIC);
      await keyring.importFamilySeed(SECP_SEED);

      const raw = storage.data.get('flama.wallet.vault.v2');
      expect(raw).toBeDefined();
      expect(raw).not.toContain('abandon');
      expect(raw).not.toContain(SECP_SEED);

      const envelope = JSON.parse(raw as string);
      expect(envelope).toMatchObject({
        version: 2,
        kdf: { algo: 'scrypt', n: 1024, r: 8, p: 1 },
      });
      expect(typeof envelope.wrappedKey.nonce).toBe('string');
      expect(typeof envelope.data.ciphertext).toBe('string');
    });
  });
});
