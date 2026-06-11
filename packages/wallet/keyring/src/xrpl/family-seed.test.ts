import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';
import { bytesToHex } from '@noble/hashes/utils';
import { deriveKeypair, generateSeed } from 'ripple-keypairs';
import { describe, expect, it } from 'vitest';
import { createFamilySeedSigner, InvalidFamilySeedError, isValidFamilySeed } from './family-seed';

const ENTROPY = Uint8Array.from({ length: 16 }, (_, i) => i + 1);
const SECP_SEED = generateSeed({
  entropy: ENTROPY,
  algorithm: 'ecdsa-secp256k1',
});
const ED_SEED = generateSeed({ entropy: ENTROPY, algorithm: 'ed25519' });

describe('isValidFamilySeed', () => {
  it('accepts both seed flavors', () => {
    expect(isValidFamilySeed(SECP_SEED)).toBe(true);
    expect(isValidFamilySeed(ED_SEED)).toBe(true);
  });

  it('rejects garbage', () => {
    expect(isValidFamilySeed('not-a-seed')).toBe(false);
    expect(isValidFamilySeed('')).toBe(false);
    expect(isValidFamilySeed('rDarPNJEpCnpBZSfmcquydockkePkjPGA2')).toBe(false);
  });
});

describe('createFamilySeedSigner', () => {
  it('throws InvalidFamilySeedError on bad input', () => {
    expect(() => createFamilySeedSigner('garbage')).toThrow(InvalidFamilySeedError);
  });

  it('builds a working secp256k1 signer from a classic seed', async () => {
    const signer = createFamilySeedSigner(SECP_SEED);
    expect(signer.curve).toBe('secp256k1');
    expect(bytesToHex(signer.publicKey)).toBe(deriveKeypair(SECP_SEED).publicKey.toLowerCase());

    const digest = new Uint8Array(32).fill(7);
    const { signature, recovery } = await signer.signDigest(digest);
    expect(signature).toHaveLength(64);
    expect([0, 1]).toContain(recovery);
    expect(secp256k1.verify(signature, digest, signer.publicKey)).toBe(true);
  });

  it('builds a working ed25519 signer from an sEd seed', async () => {
    expect(ED_SEED.startsWith('sEd')).toBe(true);
    const signer = createFamilySeedSigner(ED_SEED);
    expect(signer.curve).toBe('ed25519');
    expect(signer.publicKey).toHaveLength(32);
    // ripple-keypairs prefixes ed25519 public keys with 'ED'.
    expect(bytesToHex(signer.publicKey)).toBe(
      deriveKeypair(ED_SEED).publicKey.slice(2).toLowerCase(),
    );

    const message = new Uint8Array([1, 2, 3, 4]);
    const result = await signer.signMessage?.(message);
    expect(result?.recovery).toBeUndefined();
    expect(result?.signature).toHaveLength(64);
    // biome-ignore lint/style/noNonNullAssertion: asserted above
    expect(ed25519.verify(result!.signature, message, signer.publicKey)).toBe(true);
  });

  it('rejects signDigest on ed25519 signers', async () => {
    const signer = createFamilySeedSigner(ED_SEED);
    await expect(signer.signDigest(new Uint8Array(32))).rejects.toThrow(/signMessage/);
  });
});
