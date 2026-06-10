import { secp256k1 } from '@noble/curves/secp256k1';
import { describe, expect, it } from 'vitest';
import { derivationPath } from './derivation';
import { InvalidMnemonicError } from './errors';
import { KeyringManager } from './keyring-manager';
import type { SecureStorage } from './storage';

const MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

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

describe('KeyringManager', () => {
  it('rejects an invalid mnemonic', async () => {
    const keyring = new KeyringManager(memoryStorage());
    await expect(keyring.importMnemonic('not a valid phrase')).rejects.toThrow(
      InvalidMnemonicError,
    );
  });

  it('normalizes whitespace and casing on import', async () => {
    const keyring = new KeyringManager(memoryStorage());
    const wallet = await keyring.importMnemonic(
      `  ${MNEMONIC.toUpperCase().replace(/ /g, '   ')} `,
    );
    expect(keyring.exportMnemonic(wallet.id)).toBe(MNEMONIC);
  });

  it('persists the vault and restores it', async () => {
    const storage = memoryStorage();
    const first = new KeyringManager(storage);
    const wallet = await first.importMnemonic(MNEMONIC, 'Main');

    const second = new KeyringManager(storage);
    await second.restore();
    expect(second.isInitialized).toBe(true);
    expect(second.getWallets()).toEqual([{ id: wallet.id, name: 'Main', type: 'hd' }]);
  });

  it('derives deterministic signers per chain path', async () => {
    const keyring = new KeyringManager(memoryStorage());
    const wallet = await keyring.importMnemonic(MNEMONIC);

    const xrpl = keyring.getSigner(wallet.id, derivationPath('xrpl', 0));
    const evm = keyring.getSigner(wallet.id, derivationPath('evm', 0));

    expect(xrpl.publicKey).toHaveLength(33);
    expect(evm.publicKey).toHaveLength(33);
    expect(Buffer.from(xrpl.publicKey).toString('hex')).not.toBe(
      Buffer.from(evm.publicKey).toString('hex'),
    );

    const again = keyring.getSigner(wallet.id, derivationPath('xrpl', 0));
    expect(again.publicKey).toEqual(xrpl.publicKey);
  });

  it('produces signatures that verify against the public key', async () => {
    const keyring = new KeyringManager(memoryStorage());
    const wallet = await keyring.importMnemonic(MNEMONIC);
    const signer = keyring.getSigner(wallet.id, derivationPath('xrpl', 0));

    const digest = new Uint8Array(32).fill(7);
    const { signature, recovery } = await signer.signDigest(digest);

    expect(signature).toHaveLength(64);
    expect([0, 1]).toContain(recovery);
    expect(secp256k1.verify(signature, digest, signer.publicKey)).toBe(true);
  });

  it('reset clears the vault from storage', async () => {
    const storage = memoryStorage();
    const keyring = new KeyringManager(storage);
    await keyring.importMnemonic(MNEMONIC);
    expect(storage.data.size).toBe(1);

    await keyring.reset();
    expect(keyring.isInitialized).toBe(false);
    expect(storage.data.size).toBe(0);
  });
});
