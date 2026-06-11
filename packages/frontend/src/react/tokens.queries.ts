'use client';

import type { TokenBalance, TokenInfo, TxResult } from '@flama/chain-core';
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useFlamaApp } from './context';

export const tokensKeys = {
  all: ['tokens'] as const,
  list: (chainId: string) => ['tokens', 'list', chainId] as const,
  balance: (chainId: string, issuer: string, symbol: string) =>
    ['tokens', 'balance', chainId, issuer, symbol] as const,
};

/** Non-native tokens (XRPL trustlines / ERC-20s) held on `chainId`. */
export function useTokens(
  chainId: string,
  options?: Omit<UseQueryOptions<TokenBalance[], Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: tokensKeys.list(chainId),
    queryFn: () => app.tokens.list(chainId),
    refetchInterval: 15_000,
    ...options,
  });
}

export function useTokenBalance(
  chainId: string,
  token: TokenInfo,
  options?: Omit<UseQueryOptions<TokenBalance, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: tokensKeys.balance(chainId, token.issuer, token.symbol),
    queryFn: () => app.tokens.getBalance(chainId, token),
    refetchInterval: 15_000,
    ...options,
  });
}

export interface SendTokenInput {
  chainId: string;
  to: string;
  token: TokenInfo;
  /** Human-readable decimal amount, e.g. "1.5". */
  amount: string;
}

export function useSendToken(
  options?: Omit<UseMutationOptions<TxResult, Error, SendTokenInput>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chainId, to, token, amount }: SendTokenInput) =>
      app.tokens.send(chainId, to, token, amount),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: tokensKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export interface RegisterTokenInput {
  chainId: string;
  token: TokenInfo;
  /** Max amount the account is willing to hold (human-readable). */
  limit?: string;
}

/** Registers a token (XRPL trustline) so the account can receive it. */
export function useRegisterToken(
  options?: Omit<UseMutationOptions<TxResult, Error, RegisterTokenInput>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chainId, token, limit }: RegisterTokenInput) =>
      app.tokens.register(chainId, token, limit),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: tokensKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
