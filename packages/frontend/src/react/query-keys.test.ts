import type { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { explorerKeys, invalidateAfterTransfer, tokensKeys, walletKeys } from './query-keys';

describe('invalidateAfterTransfer', () => {
  it('invalidates native balances, token balances and the activity feed', () => {
    const invalidateQueries = vi.fn();
    const queryClient = { invalidateQueries } as unknown as QueryClient;

    invalidateAfterTransfer(queryClient);

    expect(invalidateQueries).toHaveBeenCalledTimes(3);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: walletKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: tokensKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: explorerKeys.all,
    });
  });
});

describe('explorerKeys.accountTx', () => {
  it('keys distinct pages separately so cursors do not collide', () => {
    const pageA = explorerKeys.accountTx('xrpl:testnet', 'rAddr', {
      cursor: 'A',
    });
    const pageB = explorerKeys.accountTx('xrpl:testnet', 'rAddr', {
      cursor: 'B',
    });
    expect(pageA).not.toEqual(pageB);
  });

  it('normalizes an absent query to null in the key', () => {
    const key = explorerKeys.accountTx('xrpl:testnet', 'rAddr');
    expect(key[4]).toBeNull();
  });
});
