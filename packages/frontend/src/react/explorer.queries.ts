'use client';

import type { AccountTxPage, AccountTxQuery, Block } from '@flama/chain-core';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useFlamaApp } from './context';
import { explorerKeys } from './query-keys';

export { explorerKeys } from './query-keys';

export function useRecentBlocks(
  chainId: string,
  limit?: number,
  options?: Omit<UseQueryOptions<Block[], Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: explorerKeys.blocks(chainId),
    queryFn: () => app.explorer.getRecentBlocks(chainId, limit),
    refetchInterval: 15_000,
    ...options,
  });
}

export function useAccountTransactions(
  chainId: string,
  address: string | undefined,
  query?: AccountTxQuery,
  options?: Omit<UseQueryOptions<AccountTxPage, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: explorerKeys.accountTx(chainId, address ?? '', query),
    // `enabled` keeps this from running until `address` is defined.
    queryFn: () => app.explorer.getAccountTransactions(chainId, address ?? '', query),
    enabled: !!address,
    ...options,
  });
}
