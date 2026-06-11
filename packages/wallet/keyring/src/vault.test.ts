import { randomBytes } from '@noble/hashes/utils';
import { describe, expect, it } from 'vitest';
import { InvalidPasscodeError, VaultCorruptedError } from './errors';
import {
  createEnvelope,
  decryptVaultData,
  encryptVaultData,
  type KdfParams,
  parseEnvelope,
  rewrapVaultKey,
  serializeEnvelope,
  unwrapVaultKey,
  type VaultData,
} from './vault';

const KDF: KdfParams = { n: 1024, r: 8, p: 1 };

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
  it('roundtrips through serialize → parse → unwrap → decrypt', () => {
    const vaultKey = randomBytes(32);
    const envelope = createEnvelope('123456', vaultKey, data, KDF);
    const parsed = parseEnvelope(serializeEnvelope(envelope));

    expect(parsed.version).toBe(2);
    expect(parsed.kdf).toMatchObject({ algo: 'scrypt', n: 1024, r: 8, p: 1 });

    const unwrapped = unwrapVaultKey(parsed, '123456');
    expect(unwrapped).toEqual(vaultKey);
    expect(decryptVaultData(parsed, unwrapped)).toEqual(data);
  });

  it('rejects a wrong passcode with InvalidPasscodeError', () => {
    const envelope = createEnvelope('123456', randomBytes(32), data, KDF);
    expect(() => unwrapVaultKey(envelope, '654321')).toThrow(InvalidPasscodeError);
  });

  it('rejects a wrong vault key with InvalidPasscodeError', () => {
    const envelope = createEnvelope('123456', randomBytes(32), data, KDF);
    expect(() => decryptVaultData(envelope, randomBytes(32))).toThrow(InvalidPasscodeError);
  });

  it('rejects malformed envelopes with VaultCorruptedError', () => {
    expect(() => parseEnvelope('not json')).toThrow(VaultCorruptedError);
    expect(() => parseEnvelope('{"version":1}')).toThrow(VaultCorruptedError);
    expect(() => parseEnvelope('{"version":2,"kdf":{"algo":"pbkdf2"}}')).toThrow(
      VaultCorruptedError,
    );

    const envelope = createEnvelope('123456', randomBytes(32), data, KDF);
    const badBase64 = {
      ...envelope,
      kdf: { ...envelope.kdf, salt: '!!!not-base64!!!' },
    };
    expect(() => unwrapVaultKey(badBase64, '123456')).toThrow(VaultCorruptedError);
  });

  it('detects ciphertext tampering as an auth failure', () => {
    const envelope = createEnvelope('123456', randomBytes(32), data, KDF);
    const ciphertext = envelope.wrappedKey.ciphertext;
    const flipped = (ciphertext[0] === 'A' ? 'B' : 'A') + ciphertext.slice(1);
    const tampered = {
      ...envelope,
      wrappedKey: { ...envelope.wrappedKey, ciphertext: flipped },
    };
    expect(() => unwrapVaultKey(tampered, '123456')).toThrow(InvalidPasscodeError);
  });

  it('re-encrypts the data blob with a fresh nonce, keeping the wrapped key', () => {
    const vaultKey = randomBytes(32);
    const envelope = createEnvelope('123456', vaultKey, data, KDF);
    const next: VaultData = { ...data, activeWalletId: null };

    const updated = encryptVaultData(envelope, vaultKey, next);
    expect(updated.wrappedKey).toEqual(envelope.wrappedKey);
    expect(updated.kdf).toEqual(envelope.kdf);
    expect(updated.data.nonce).not.toBe(envelope.data.nonce);
    expect(decryptVaultData(updated, vaultKey)).toEqual(next);
  });

  it('rewraps the same vault key under a new passcode with a fresh salt', () => {
    const vaultKey = randomBytes(32);
    const envelope = createEnvelope('123456', vaultKey, data, KDF);

    const rewrapped = rewrapVaultKey(envelope, vaultKey, '654321', KDF);
    expect(rewrapped.kdf.salt).not.toBe(envelope.kdf.salt);
    expect(rewrapped.data).toEqual(envelope.data);
    expect(() => unwrapVaultKey(rewrapped, '123456')).toThrow(InvalidPasscodeError);
    expect(unwrapVaultKey(rewrapped, '654321')).toEqual(vaultKey);
  });
});
