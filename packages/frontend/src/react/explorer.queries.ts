'use client';

import type { Block } from '@flama/chain-core';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useFlamaApp } from './context';

export const explorerKeys = {
  all: ['explorer'] as const,
  blocks: (chainId: string) => ['explorer', 'blocks', chainId] as const,
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
