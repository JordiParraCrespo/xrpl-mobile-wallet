import { derivationPath, KeyringManager, type SecureStorage } from '@flama/wallet-keyring';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha512 } from '@noble/hashes/sha512';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { isValidClassicAddress } from 'ripple-address-codec';
import { decode, encodeForSigning } from 'ripple-binary-codec';
import { describe, expect, it } from 'vitest';
import { XrplAdapter } from './adapter';
import { XRPL_TESTNET } from './config';

const MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

function memoryStorage(): SecureStorage {
  const data = new Map<string, string>();
  return {
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => {
      data.set(key, value);
    },
    remove: async (key) => {
      data.delete(key);
    },
  };
}

async function testSigner() {
  const keyring = new KeyringManager(memoryStorage());
  const wallet = await keyring.importMnemonic(MNEMONIC);
  return keyring.getSigner(wallet.id, derivationPath('xrpl', 0));
}

describe('XrplAdapter', () => {
  it('derives a valid, deterministic classic address from the keyring pubkey', async () => {
    const adapter = new XrplAdapter(XRPL_TESTNET);
    const signer = await testSigner();
    const address = adapter.deriveAddress(signer.publicKey);

    expect(isValidClassicAddress(address)).toBe(true);
    expect(adapter.deriveAddress(signer.publicKey)).toBe(address);
    expect(adapter.isValidAddress(address)).toBe(true);
    expect(adapter.isValidAddress('not-an-address')).toBe(false);
  });

  it('signs a payment whose signature verifies and round-trips through the codec', async () => {
    const adapter = new XrplAdapter(XRPL_TESTNET);
    const signer = await testSigner();
    const account = adapter.deriveAddress(signer.publicKey);

    const tx = {
      TransactionType: 'Payment',
      Account: account,
      Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
      Amount: '1000000',
      Fee: '12',
      Sequence: 1,
      LastLedgerSequence: 100,
    };

    // Same pipeline the adapter uses internally.
    const blob = await (
      adapter as unknown as {
        signPayment(tx: Record<string, unknown>, s: typeof signer): Promise<string>;
      }
    ).signPayment({ ...tx }, signer);

    const decoded = decode(blob) as Record<string, unknown>;
    expect(decoded.Account).toBe(account);
    expect(decoded.SigningPubKey).toBe(bytesToHex(signer.publicKey).toUpperCase());

    const digest = sha512(hexToBytes(encodeForSigning(decoded))).slice(0, 32);
    const signature = secp256k1.Signature.fromDER(decoded.TxnSignature as string);
    expect(secp256k1.verify(signature, digest, signer.publicKey)).toBe(true);
    expect(signature.hasHighS()).toBe(false);
  });
});
