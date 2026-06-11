export type SignerCurve = 'secp256k1' | 'ed25519';

export interface SignatureResult {
  /**
   * secp256k1: 64-byte compact signature (r || s), low-s normalized.
   * ed25519: 64-byte EdDSA signature.
   */
  signature: Uint8Array;
  /** Recovery id (0 or 1). Present for secp256k1 only — EVM chains need it. */
  recovery?: number;
}

/**
 * Bridge between key management and chain adapters: adapters serialize
 * transactions, the signer signs. Private keys never leave the keyring
 * package.
 *
 * The two curves split the work differently: secp256k1 chains hash the
 * serialized transaction themselves and hand the signer a digest, while
 * XRPL's ed25519 scheme signs the full signing payload (the curve hashes
 * internally). Adapters pick the entry point based on `curve`.
 */
export interface Signer {
  readonly curve: SignerCurve;
  /** secp256k1: compressed public key (33 bytes). ed25519: raw key (32 bytes). */
  readonly publicKey: Uint8Array;
  /** Sign a precomputed 32-byte digest. ed25519 signers reject this. */
  signDigest(digest: Uint8Array): Promise<SignatureResult>;
  /** Sign the full message bytes. Required for ed25519, optional otherwise. */
  signMessage?(message: Uint8Array): Promise<SignatureResult>;
}
