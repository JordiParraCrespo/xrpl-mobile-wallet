import { describe, expect, it } from 'vitest';
import { VaultCorruptedError } from './errors';
import {
  createPasscodeVerifier,
  parseVault,
  serializeVault,
  type VaultData,
  verifyPasscode,
} from './vault';

const data: VaultData = {
  version: 2,
  wallets: [
    {
      id: 'abc',
      name: 'Main',
      type: 'hd',
      mnemonic: 'legal winner thank year wave sausage worth useful legal winner thank yellow',
      backedUp: true,
      createdAt: 1700000000000,
    },
  ],
  activeWalletId: 'abc',
};

describe('vault', () => {
  describe('passcode verifier', () => {
    it('accepts the right passcode and rejects a wrong one', () => {
      const verifier = createPasscodeVerifier('123456');
      expect(verifyPasscode('123456', verifier)).toBe(true);
      expect(verifyPasscode('654321', verifier)).toBe(false);
    });

    it('uses a random salt so two verifiers for the same passcode differ', () => {
      const a = createPasscodeVerifier('123456');
      const b = createPasscodeVerifier('123456');
      expect(a).not.toBe(b);
      // Both still verify the same passcode.
      expect(verifyPasscode('123456', a)).toBe(true);
      expect(verifyPasscode('123456', b)).toBe(true);
    });

    it('never stores the raw passcode', () => {
      const verifier = createPasscodeVerifier('123456');
      expect(verifier).not.toContain('123456');
    });

    it('throws VaultCorruptedError on non-JSON', () => {
      expect(() => verifyPasscode('123456', 'not json')).toThrow(VaultCorruptedError);
    });

    it('throws VaultCorruptedError on a wrong-shape verifier', () => {
      expect(() => verifyPasscode('123456', JSON.stringify({ salt: 'aa' }))).toThrow(
        VaultCorruptedError,
      );
      expect(() => verifyPasscode('123456', JSON.stringify({ salt: 1, hash: 2 }))).toThrow(
        VaultCorruptedError,
      );
    });
  });

  describe('serialize / parse', () => {
    it('round-trips a vault', () => {
      expect(parseVault(serializeVault(data))).toEqual(data);
    });

    it('round-trips a vault with a null activeWalletId', () => {
      const next: VaultData = { ...data, activeWalletId: null };
      expect(parseVault(serializeVault(next))).toEqual(next);
    });

    it('throws VaultCorruptedError on non-JSON', () => {
      expect(() => parseVault('not json')).toThrow(VaultCorruptedError);
    });

    it('throws VaultCorruptedError on a wrong version', () => {
      expect(() =>
        parseVault(JSON.stringify({ version: 1, wallets: [], activeWalletId: null })),
      ).toThrow(VaultCorruptedError);
    });

    it('throws VaultCorruptedError on a non-array wallets', () => {
      expect(() =>
        parseVault(JSON.stringify({ version: 2, wallets: {}, activeWalletId: null })),
      ).toThrow(VaultCorruptedError);
    });

    it('throws VaultCorruptedError on a bad activeWalletId type', () => {
      expect(() =>
        parseVault(JSON.stringify({ version: 2, wallets: [], activeWalletId: 42 })),
      ).toThrow(VaultCorruptedError);
    });
  });
});
