'use client';

import type { Balance, TxResult } from '@flama/chain-core';
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { WalletInfo } from '../modules/wallet';
import { useFlamaApp } from './context';
import { invalidateAfterTransfer, walletKeys } from './query-keys';

export { walletKeys } from './query-keys';

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

export interface CreateWalletInput {
  name?: string;
  /** Mnemonic length for the new HD wallet. Defaults to the keyring's default. */
  words?: 12 | 24;
}

export function useCreateWallet(
  options?: Omit<
    // biome-ignore lint/suspicious/noConfusingVoidType: `void` lets callers run `mutate()` with no input
    UseMutationOptions<WalletInfo, Error, CreateWalletInput | void>,
    'mutationFn'
  >,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    // biome-ignore lint/suspicious/noConfusingVoidType: `void` lets callers run `mutate()` with no input
    mutationFn: (input: CreateWalletInput | void) => app.wallet.createWallet(input ?? undefined),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useImportWallet(
  options?: Omit<UseMutationOptions<WalletInfo, Error, string>, 'mutationFn'>,
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

export interface ImportFamilySeedInput {
  seed: string;
  name?: string;
}

export function useImportFamilySeed(
  options?: Omit<UseMutationOptions<WalletInfo, Error, ImportFamilySeedInput>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seed, name }: ImportFamilySeedInput) => app.wallet.importFamilySeed(seed, name),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export interface ImportSecretNumbersInput {
  rows: string[];
  name?: string;
}

export function useImportSecretNumbers(
  options?: Omit<UseMutationOptions<WalletInfo, Error, ImportSecretNumbersInput>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rows, name }: ImportSecretNumbersInput) =>
      app.wallet.importSecretNumbers(rows, name),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useSetActiveWallet(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => app.wallet.setActiveWallet(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export interface RenameWalletInput {
  id: string;
  name: string;
}

export function useRenameWallet(
  options?: Omit<UseMutationOptions<void, Error, RenameWalletInput>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: RenameWalletInput) => app.wallet.renameWallet(id, name),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useRemoveWallet(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => app.wallet.removeWallet(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useMarkWalletBackedUp(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => app.wallet.markBackedUp(id),
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
      // A send moves the native balance, costs a fee and adds a history row.
      invalidateAfterTransfer(queryClient);
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export interface RequestFaucetFundsInput {
  chainId: string;
}

export function useRequestFaucetFunds(
  options?: Omit<UseMutationOptions<void, Error, RequestFaucetFundsInput>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chainId }: RequestFaucetFundsInput) => app.wallet.requestFaucetFunds(chainId),
    onSuccess: (...args) => {
      // Faucet funding credits the balance and shows up as an incoming tx.
      invalidateAfterTransfer(queryClient);
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
