import type { SignatureResult, Signer } from '@flama/chain-core';
import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';

export class Secp256k1Signer implements Signer {
  readonly curve = 'secp256k1' as const;
  readonly publicKey: Uint8Array;

  constructor(private readonly privateKey: Uint8Array) {
    this.publicKey = secp256k1.getPublicKey(privateKey, true);
  }

  async signDigest(digest: Uint8Array): Promise<SignatureResult> {
    const signature = secp256k1.sign(digest, this.privateKey, { lowS: true });
    return {
      signature: signature.toCompactRawBytes(),
      recovery: signature.recovery,
    };
  }
}

/**
 * Ed25519 signs the full message — the curve hashes internally, so handing
 * it a precomputed digest would double-hash. XRPL adapters must call
 * `signMessage` with the whole signing payload.
 */
export class Ed25519Signer implements Signer {
  readonly curve = 'ed25519' as const;
  readonly publicKey: Uint8Array;

  constructor(private readonly privateKey: Uint8Array) {
    this.publicKey = ed25519.getPublicKey(privateKey);
  }

  async signDigest(): Promise<SignatureResult> {
    throw new Error('ed25519 signs full messages; use signMessage() instead of signDigest()');
  }

  async signMessage(message: Uint8Array): Promise<SignatureResult> {
    return { signature: ed25519.sign(message, this.privateKey) };
  }
}
