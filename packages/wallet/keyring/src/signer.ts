import type { SignatureResult, Signer } from '@flama/chain-core';
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
