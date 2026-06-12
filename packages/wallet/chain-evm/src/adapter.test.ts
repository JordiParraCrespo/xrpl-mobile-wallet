import type { NetworkConfig } from '@flama/chain-core';
import { ChainErrors, type Signer } from '@flama/chain-core';
import { KeyringManager, type SecureStorage } from '@flama/wallet-keyring';
import { parseEther, recoverTransactionAddress } from 'viem';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EvmAdapter } from './adapter';
import { XRPL_EVM_TESTNET } from './config';

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
  const keyring = new KeyringManager(memoryStorage());
  await keyring.initialize('123456');
  const wallet = await keyring.importMnemonic(MNEMONIC);
  return keyring.getSigner(wallet.id, 'evm');
}

describe('EvmAdapter', () => {
  it("derives the standard test vector address for m/44'/60'/0'/0/0", async () => {
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);
    const signer = await testSigner();
    // Known BIP-44 vector for the "abandon ... about" mnemonic.
    expect(adapter.deriveAddress(signer.publicKey)).toBe(
      '0x9858EfFD232B4033E47d90003D41EC34EcaEda94',
    );
  });

  it('signs an EIP-1559 transaction recoverable to the derived address', async () => {
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);
    const signer = await testSigner();
    const account = adapter.toAccount(signer);

    const serialized = await account.signTransaction({
      chainId: 1449000,
      type: 'eip1559',
      to: '0x0000000000000000000000000000000000000001',
      value: parseEther('0.1'),
      nonce: 0,
      gas: 21000n,
      maxFeePerGas: 2_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
    });

    const recovered = await recoverTransactionAddress({
      serializedTransaction: serialized as `0x02${string}`,
    });
    expect(recovered).toBe(adapter.deriveAddress(signer.publicKey));
  });

  it('rejects signatures that are missing the recovery id', async () => {
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);
    const base = await testSigner();
    const noRecovery: Signer = {
      curve: 'secp256k1',
      publicKey: base.publicKey,
      signDigest: async (digest) => ({
        signature: (await base.signDigest(digest)).signature,
      }),
    };

    const account = adapter.toAccount(noRecovery);
    await expect(
      account.signTransaction({
        chainId: 1449000,
        type: 'eip1559',
        to: '0x0000000000000000000000000000000000000001',
        value: parseEther('0.1'),
        nonce: 0,
        gas: 21000n,
        maxFeePerGas: 2_000_000_000n,
        maxPriorityFeePerGas: 1_000_000_000n,
      }),
    ).rejects.toMatchObject({
      name: 'ChainError',
      code: ChainErrors.SIGNING_FAILED.code,
    });
  });

  it('rejects non-secp256k1 signers', () => {
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);
    const ed25519Signer: Signer = {
      curve: 'ed25519',
      publicKey: new Uint8Array(32),
      signDigest: async () => {
        throw new Error('ed25519 signers do not sign digests');
      },
    };

    expect(() => adapter.toAccount(ed25519Signer)).toThrowError(
      expect.objectContaining({
        name: 'ChainError',
        code: ChainErrors.SIGNING_FAILED.code,
      }),
    );
  });

  it('validates addresses', () => {
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);
    expect(adapter.isValidAddress('0x9858EfFD232B4033E47d90003D41EC34EcaEda94')).toBe(true);
    expect(adapter.isValidAddress('rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe')).toBe(false);
  });

  it('lists no tokens when the network has no curated token list', async () => {
    // EVM cannot enumerate held ERC-20s on chain, so an empty config means no
    // RPC calls and an empty result.
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);
    await expect(adapter.listTokens('0x9858EfFD232B4033E47d90003D41EC34EcaEda94')).resolves.toEqual(
      [],
    );
  });
});

describe('EvmAdapter.getAccountTransactions', () => {
  const ADDRESS = '0x9858EfFD232B4033E47d90003D41EC34EcaEda94';
  const OTHER = '0x0000000000000000000000000000000000000001';

  function envelope(result: unknown, status: '0' | '1' = '1', message = 'OK') {
    return {
      ok: true,
      status: 200,
      json: async () => ({ status, message, result }),
    };
  }

  function fetchReturning(value: unknown) {
    const fn = vi.fn().mockResolvedValue(value);
    vi.stubGlobal('fetch', fn);
    return fn;
  }

  function row(overrides: Record<string, string> = {}) {
    return {
      hash: '0xabc',
      from: ADDRESS,
      to: OTHER,
      value: '1000000000000000000',
      timeStamp: '1700000000',
      gasUsed: '21000',
      gasPrice: '1000000000',
      isError: '0',
      txreceipt_status: '1',
      ...overrides,
    };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps an outgoing transaction', async () => {
    const fetchMock = fetchReturning(envelope([row()]));
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);

    const page = await adapter.getAccountTransactions(ADDRESS);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('module=account&action=txlist');
    expect(url).toContain(`address=${ADDRESS}`);

    expect(page.transactions).toHaveLength(1);
    const tx = page.transactions[0];
    expect(tx.direction).toBe('out');
    expect(tx.amount).toBe(1000000000000000000n);
    expect(tx.fee).toBe(21000n * 1000000000n);
    expect(tx.counterparty).toBe(OTHER);
    expect(tx.success).toBe(true);
    expect(tx.kind).toBe('payment');
    expect(tx.symbol).toBe('XRP');
    expect(tx.timestamp).toBe(1700000000);
    expect(tx.explorerUrl).toBe(`${XRPL_EVM_TESTNET.explorerUrl}/tx/${tx.hash}`);
  });

  it('maps an incoming transaction', async () => {
    fetchReturning(envelope([row({ from: OTHER, to: ADDRESS })]));
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);

    const page = await adapter.getAccountTransactions(ADDRESS);

    const tx = page.transactions[0];
    expect(tx.direction).toBe('in');
    expect(tx.counterparty).toBe(OTHER);
  });

  it('marks a failed transaction as unsuccessful', async () => {
    fetchReturning(envelope([row({ isError: '1', txreceipt_status: '0' })]));
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);

    const page = await adapter.getAccountTransactions(ADDRESS);

    expect(page.transactions[0].success).toBe(false);
  });

  it('returns an empty page when there are no transactions', async () => {
    fetchReturning(envelope('No transactions found', '0', 'No transactions found'));
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);

    const page = await adapter.getAccountTransactions(ADDRESS);

    expect(page.transactions).toEqual([]);
    expect(page.nextCursor).toBeUndefined();
  });

  it('paginates: a full page yields a nextCursor', async () => {
    const rows = Array.from({ length: 5 }, (_, i) => row({ hash: `0x${i}` }));
    fetchReturning(envelope(rows));
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);

    const page = await adapter.getAccountTransactions(ADDRESS, { limit: 5 });

    expect(page.transactions).toHaveLength(5);
    expect(page.nextCursor).toBe('2');
  });

  it('paginates: a partial page has no nextCursor', async () => {
    fetchReturning(envelope([row(), row({ hash: '0xdef' })]));
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);

    const page = await adapter.getAccountTransactions(ADDRESS, { limit: 5 });

    expect(page.transactions).toHaveLength(2);
    expect(page.nextCursor).toBeUndefined();
  });

  it('passes the cursor through as the page query param', async () => {
    const fetchMock = fetchReturning(envelope([]));
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);

    await adapter.getAccountTransactions(ADDRESS, { cursor: '3', limit: 10 });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('page=3');
    expect(url).toContain('offset=10');
  });

  it('throws RPC when no history endpoint is configured', async () => {
    const config: NetworkConfig = {
      ...XRPL_EVM_TESTNET,
      explorerApiUrl: undefined,
    };
    const adapter = new EvmAdapter(config);

    await expect(adapter.getAccountTransactions(ADDRESS)).rejects.toMatchObject({
      name: 'ChainError',
      code: ChainErrors.RPC.code,
    });
  });

  it('throws on a non-2xx response', async () => {
    fetchReturning({
      ok: false,
      status: 502,
      json: async () => ({}),
    });
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);

    await expect(adapter.getAccountTransactions(ADDRESS)).rejects.toMatchObject({
      name: 'ChainError',
      code: ChainErrors.RPC.code,
    });
  });

  it('throws NETWORK when the transport fails', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('connection refused'));
    vi.stubGlobal('fetch', fn);
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);

    await expect(adapter.getAccountTransactions(ADDRESS)).rejects.toMatchObject({
      name: 'ChainError',
      code: ChainErrors.NETWORK.code,
    });
  });
});
