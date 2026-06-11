export interface SignatureResult {
  /** 64-byte compact signature (r || s), low-s normalized. */
  signature: Uint8Array;
  /** Recovery id (0 or 1), required by EVM chains. */
  recovery: number;
}

/**
 * Bridge between key management and chain adapters: adapters serialize and
 * hash transactions, the signer signs the digest. Private keys never leave
 * the keyring package.
 */
export interface Signer {
  readonly curve: 'secp256k1';
  /** Compressed public key (33 bytes). */
  readonly publicKey: Uint8Array;
  signDigest(digest: Uint8Array): Promise<SignatureResult>;
}
