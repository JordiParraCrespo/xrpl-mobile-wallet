import type { Signer } from '@flama/chain-core';
import { hexToBytes } from '@noble/hashes/utils';
import { decodeSeed } from 'ripple-address-codec';
import { deriveKeypair } from 'ripple-keypairs';
import { Ed25519Signer, Secp256k1Signer } from '../signer';

export class InvalidFamilySeedError extends Error {
  constructor() {
    super('Invalid XRPL family seed');
    this.name = 'InvalidFamilySeedError';
  }
}

/** Whether `seed` is a valid base58check-encoded XRPL family seed. */
export function isValidFamilySeed(seed: string): boolean {
  try {
    decodeSeed(seed);
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds a signer from a family seed via XRPL account key derivation.
 * `sEd…` seeds yield an ed25519 signer, classic `s…` seeds secp256k1.
 */
export function createFamilySeedSigner(seed: string): Signer {
  if (!isValidFamilySeed(seed)) {
    throw new InvalidFamilySeedError();
  }
  // deriveKeypair prefixes the 32-byte private key: '00' secp256k1, 'ED' ed25519.
  const { privateKey } = deriveKeypair(seed);
  const raw = hexToBytes(privateKey.slice(2));
  return privateKey.slice(0, 2).toUpperCase() === 'ED'
    ? new Ed25519Signer(raw)
    : new Secp256k1Signer(raw);
}
