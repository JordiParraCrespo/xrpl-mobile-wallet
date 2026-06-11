'use client';

import type { AccountTxPage, AccountTxQuery, Block } from '@flama/chain-core';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useFlamaApp } from './context';

export const explorerKeys = {
  all: ['explorer'] as const,
  blocks: (chainId: string) => ['explorer', 'blocks', chainId] as const,
  accountTx: (chainId: string, address: string) =>
    ['explorer', 'accountTx', chainId, address] as const,
};

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
    queryKey: explorerKeys.accountTx(chainId, address ?? ''),
    // `enabled` keeps this from running until `address` is defined.
    queryFn: () => app.explorer.getAccountTransactions(chainId, address ?? '', query),
    enabled: !!address,
    ...options,
  });
}
