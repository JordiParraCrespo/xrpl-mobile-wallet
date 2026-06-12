import type {
  AccountTxPage,
  AccountTxQuery,
  Block,
  ChainAdapter,
  NetworkConfig,
} from '@flama/chain-core';
import { ChainRegistry } from '@flama/chain-core';
import { describe, expect, it, vi } from 'vitest';
import { ExplorerErrors } from './explorer.errors';
import { ExplorerService } from './explorer.service';

const config = (chainId: string): NetworkConfig => ({
  chainId,
  kind: 'xrpl',
  name: chainId,
  rpcUrl: 'https://example.test',
  nativeCurrency: { symbol: 'XRP', decimals: 6 },
});

const blocks: Block[] = [{ height: 1, hash: 'b1', timestamp: 1, transactionCount: 0 }];

const page: AccountTxPage = {
  transactions: [
    {
      hash: 'tx1',
      timestamp: 100,
      kind: 'payment',
      direction: 'in',
      success: true,
      amount: 1000n,
      symbol: 'XRP',
    },
  ],
  nextCursor: 'cursor-2',
};

/** Adapter that supports history; only the bits ExplorerService touches are real. */
function adapterWithHistory(
  chainId: string,
  getAccountTransactions: ChainAdapter['getAccountTransactions'],
) {
  return {
    config: config(chainId),
    getRecentBlocks: vi.fn(async () => blocks),
    getAccountTransactions,
  } as unknown as ChainAdapter;
}

/** Adapter without the optional getAccountTransactions method. */
function adapterWithoutHistory(chainId: string) {
  return {
    config: config(chainId),
    getRecentBlocks: vi.fn(async () => blocks),
  } as unknown as ChainAdapter;
}

describe('ExplorerService', () => {
  describe('getAccountTransactions', () => {
    it("returns the adapter's page", async () => {
      const fn = vi.fn(async () => page);
      const registry = new ChainRegistry([adapterWithHistory('xrpl:testnet', fn)]);
      const service = new ExplorerService(registry);

      await expect(service.getAccountTransactions('xrpl:testnet', 'rAddr')).resolves.toBe(page);
    });

    it('passes the query through to the adapter', async () => {
      const fn = vi.fn(async () => page);
      const registry = new ChainRegistry([adapterWithHistory('xrpl:testnet', fn)]);
      const service = new ExplorerService(registry);

      const query: AccountTxQuery = { limit: 25, cursor: 'cursor-1' };
      await service.getAccountTransactions('xrpl:testnet', 'rAddr', query);

      expect(fn).toHaveBeenCalledWith('rAddr', query);
    });

    it('throws HISTORY_UNAVAILABLE when the adapter lacks the method', async () => {
      const registry = new ChainRegistry([adapterWithoutHistory('xrpl:testnet')]);
      const service = new ExplorerService(registry);

      await expect(service.getAccountTransactions('xrpl:testnet', 'rAddr')).rejects.toMatchObject({
        code: ExplorerErrors.HISTORY_UNAVAILABLE.code,
      });
    });

    it('throws UNKNOWN_CHAIN for an unregistered chain', async () => {
      const registry = new ChainRegistry([
        adapterWithHistory(
          'xrpl:testnet',
          vi.fn(async () => page),
        ),
      ]);
      const service = new ExplorerService(registry);

      await expect(service.getAccountTransactions('evm:1449000', 'rAddr')).rejects.toMatchObject({
        code: ExplorerErrors.UNKNOWN_CHAIN.code,
      });
    });
  });

  describe('getRecentBlocks', () => {
    it('still delegates to the adapter', async () => {
      const registry = new ChainRegistry([adapterWithoutHistory('xrpl:testnet')]);
      const service = new ExplorerService(registry);

      await expect(service.getRecentBlocks('xrpl:testnet', 5)).resolves.toBe(blocks);
    });
  });
});
