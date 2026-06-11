import { ChainErrors, type Signer } from '@flama/chain-core';
import { KeyringManager, type SecureStorage } from '@flama/wallet-keyring';
import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha512 } from '@noble/hashes/sha512';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { isValidClassicAddress } from 'ripple-address-codec';
import { decode, encodeForSigning } from 'ripple-binary-codec';
import { deriveAddress, verify } from 'ripple-keypairs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { XrplAdapter } from './adapter';
import { XRPL_MAINNET, XRPL_TESTNET } from './config';

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
  // Light KDF params: these tests exercise the adapter, not the vault.
  const keyring = new KeyringManager(memoryStorage(), { n: 1024, r: 8, p: 1 });
  await keyring.initialize('123456');
  const wallet = await keyring.importMnemonic(MNEMONIC);
  return keyring.getSigner(wallet.id, 'xrpl');
}

// Deterministic 32-byte ed25519 private key, local to this test file: the
// keyring package is being reworked, so we exercise the adapter's ed25519
// path with @noble/curves directly.
const ED25519_PRIVATE_KEY = sha512(new TextEncoder().encode('flama ed25519 adapter test')).slice(
  0,
  32,
);

function ed25519TestSigner(): Signer {
  return {
    curve: 'ed25519',
    publicKey: ed25519.getPublicKey(ED25519_PRIVATE_KEY),
    signDigest: async () => {
      throw new Error('ed25519 signers do not sign digests');
    },
    signMessage: async (message) => ({
      signature: ed25519.sign(message, ED25519_PRIVATE_KEY),
    }),
  };
}

function signPayment(
  adapter: XrplAdapter,
  tx: Record<string, unknown>,
  signer: Signer,
): Promise<string> {
  // Same pipeline the adapter uses internally.
  return (
    adapter as unknown as {
      signTransaction(tx: Record<string, unknown>, s: Signer): Promise<string>;
    }
  ).signTransaction(tx, signer);
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
        signTransaction(tx: Record<string, unknown>, s: typeof signer): Promise<string>;
      }
    ).signTransaction({ ...tx }, signer);

    const decoded = decode(blob) as Record<string, unknown>;
    expect(decoded.Account).toBe(account);
    expect(decoded.SigningPubKey).toBe(bytesToHex(signer.publicKey).toUpperCase());

    const digest = sha512(hexToBytes(encodeForSigning(decoded))).slice(0, 32);
    const signature = secp256k1.Signature.fromDER(decoded.TxnSignature as string);
    expect(secp256k1.verify(signature, digest, signer.publicKey)).toBe(true);
    expect(signature.hasHighS()).toBe(false);
  });

  it('derives the ED-prefixed address for a 32-byte ed25519 pubkey', () => {
    const adapter = new XrplAdapter(XRPL_TESTNET);
    const signer = ed25519TestSigner();
    const address = adapter.deriveAddress(signer.publicKey);

    expect(signer.publicKey.length).toBe(32);
    expect(address).toBe(deriveAddress(`ED${bytesToHex(signer.publicKey)}`.toUpperCase()));
    expect(isValidClassicAddress(address)).toBe(true);
  });

  it('signs a payment with ed25519 over the full signing payload', async () => {
    const adapter = new XrplAdapter(XRPL_TESTNET);
    const signer = ed25519TestSigner();
    const account = adapter.deriveAddress(signer.publicKey);
    const edPubKey = `ED${bytesToHex(signer.publicKey)}`.toUpperCase();

    const blob = await signPayment(
      adapter,
      {
        TransactionType: 'Payment',
        Account: account,
        Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
        Amount: '1000000',
        Fee: '12',
        Sequence: 1,
        LastLedgerSequence: 100,
      },
      signer,
    );

    const decoded = decode(blob) as Record<string, unknown>;
    expect(decoded.Account).toBe(account);
    expect(decoded.SigningPubKey).toBe(edPubKey);
    // Raw 64-byte EdDSA signature, not DER.
    expect(decoded.TxnSignature).toMatch(/^[0-9A-F]{128}$/);
    // ripple-keypairs verifies ed25519 over the full signing payload
    // (prefix included), without a sha512-half pre-hash.
    expect(verify(encodeForSigning(decoded), decoded.TxnSignature as string, edPubKey)).toBe(true);
  });

  it('rejects ed25519 signers that cannot sign messages', async () => {
    const adapter = new XrplAdapter(XRPL_TESTNET);
    const { signMessage: _signMessage, ...rest } = ed25519TestSigner();
    const signer: Signer = rest;

    await expect(
      signPayment(
        adapter,
        {
          TransactionType: 'Payment',
          Account: adapter.deriveAddress(signer.publicKey),
          Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
          Amount: '1000000',
          Fee: '12',
          Sequence: 1,
          LastLedgerSequence: 100,
        },
        signer,
      ),
    ).rejects.toMatchObject({
      name: 'ChainError',
      code: ChainErrors.SIGNING_FAILED.code,
    });
  });
});

describe('XrplAdapter.requestFaucet', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs the destination to the configured faucet', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = new XrplAdapter(XRPL_TESTNET);
    await adapter.requestFaucet('rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe');

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://faucet.altnet.rippletest.net/accounts',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
        }),
      },
    );
  });

  it('throws when the network has no faucet configured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const adapter = new XrplAdapter(XRPL_MAINNET);
    await expect(adapter.requestFaucet('rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe')).rejects.toMatchObject(
      {
        name: 'ChainError',
        code: ChainErrors.RPC.code,
      },
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps non-2xx faucet responses to an RPC ChainError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const adapter = new XrplAdapter(XRPL_TESTNET);
    await expect(adapter.requestFaucet('rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe')).rejects.toMatchObject(
      {
        name: 'ChainError',
        code: ChainErrors.RPC.code,
        detail: 'Faucet HTTP 503',
      },
    );
  });

  it('maps transport failures to a NETWORK ChainError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    const adapter = new XrplAdapter(XRPL_TESTNET);
    await expect(adapter.requestFaucet('rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe')).rejects.toMatchObject(
      {
        name: 'ChainError',
        code: ChainErrors.NETWORK.code,
      },
    );
  });
});

describe('XrplAdapter token signing', () => {
  it('signs an issued-currency payment carrying an IOU amount object', async () => {
    const adapter = new XrplAdapter(XRPL_TESTNET);
    const signer = await testSigner();
    const account = adapter.deriveAddress(signer.publicKey);
    const issuer = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe';

    const tx = {
      TransactionType: 'Payment',
      Account: account,
      Destination: issuer,
      Amount: { currency: 'USD', issuer, value: '1.5' },
      Fee: '12',
      Sequence: 1,
      LastLedgerSequence: 100,
    };

    const blob = await (
      adapter as unknown as {
        signTransaction(tx: Record<string, unknown>, s: typeof signer): Promise<string>;
      }
    ).signTransaction({ ...tx }, signer);

    const decoded = decode(blob) as Record<string, unknown>;
    expect(decoded.Amount).toEqual({ currency: 'USD', issuer, value: '1.5' });

    const digest = sha512(hexToBytes(encodeForSigning(decoded))).slice(0, 32);
    const signature = secp256k1.Signature.fromDER(decoded.TxnSignature as string);
    expect(secp256k1.verify(signature, digest, signer.publicKey)).toBe(true);
  });

  it('signs a TrustSet that registers a token via its LimitAmount', async () => {
    const adapter = new XrplAdapter(XRPL_TESTNET);
    const signer = await testSigner();
    const account = adapter.deriveAddress(signer.publicKey);
    const issuer = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe';

    const tx = {
      TransactionType: 'TrustSet',
      Account: account,
      LimitAmount: { currency: 'USD', issuer, value: '1000000' },
      Fee: '12',
      Sequence: 1,
      LastLedgerSequence: 100,
    };

    const blob = await (
      adapter as unknown as {
        signTransaction(tx: Record<string, unknown>, s: typeof signer): Promise<string>;
      }
    ).signTransaction({ ...tx }, signer);

    const decoded = decode(blob) as Record<string, unknown>;
    expect(decoded.TransactionType).toBe('TrustSet');
    expect(decoded.LimitAmount).toEqual({
      currency: 'USD',
      issuer,
      value: '1000000',
    });

    const digest = sha512(hexToBytes(encodeForSigning(decoded))).slice(0, 32);
    const signature = secp256k1.Signature.fromDER(decoded.TxnSignature as string);
    expect(secp256k1.verify(signature, digest, signer.publicKey)).toBe(true);
  });
});
