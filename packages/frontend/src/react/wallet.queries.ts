'use client';

import type { Balance, Block, TxResult } from '@flama/chain-core';
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useFlamaApp } from './context';

export const walletKeys = {
  all: ['wallet'] as const,
  restore: ['wallet', 'restore'] as const,
  balance: (chainId: string) => ['wallet', 'balance', chainId] as const,
  blocks: (chainId: string) => ['wallet', 'blocks', chainId] as const,
};

/** Loads the vault from secure storage on app start. */
export function useWalletRestore(
  options?: Omit<UseQueryOptions<void, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: walletKeys.restore,
    queryFn: () => app.wallet.restore(),
    retry: false,
    staleTime: Infinity,
    ...options,
  });
}

export function useImportWallet(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mnemonic: string) => app.wallet.importMnemonic(mnemonic),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useChainBalance(
  chainId: string,
  options?: Omit<UseQueryOptions<Balance, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: walletKeys.balance(chainId),
    queryFn: () => app.wallet.getBalance(chainId),
    refetchInterval: 15_000,
    ...options,
  });
}

export function useRecentBlocks(
  chainId: string,
  limit?: number,
  options?: Omit<UseQueryOptions<Block[], Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: walletKeys.blocks(chainId),
    queryFn: () => app.wallet.getRecentBlocks(chainId, limit),
    refetchInterval: 15_000,
    ...options,
  });
}

export interface SendTransactionInput {
  chainId: string;
  to: string;
  /** Human-readable decimal amount, e.g. "1.5". */
  amount: string;
}

export function useSendTransaction(
  options?: Omit<UseMutationOptions<TxResult, Error, SendTransactionInput>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chainId, to, amount }: SendTransactionInput) =>
      app.wallet.send(chainId, to, amount),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useResetWallet(
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => app.wallet.reset(),
    onSuccess: (...args) => {
      queryClient.removeQueries({ queryKey: walletKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
