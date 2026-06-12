'use client';

import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { useFlamaApp } from './context';
import { walletKeys } from './wallet.queries';

export const securityKeys = {
  all: ['security'] as const,
  restore: ['security', 'restore'] as const,
};

export function useSecurityRestore(
  options?: Omit<UseQueryOptions<null, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: securityKeys.restore,
    queryFn: async () => {
      await app.security.restore();
      return null;
    },
    retry: false,
    staleTime: Infinity,
    ...options,
  });
}

export function useSetupPasscode(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (passcode: string) => app.security.setupPasscode(passcode),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: securityKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useUnlock(options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (passcode: string) => app.security.unlock(passcode),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: securityKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useUnlockWithBiometrics(
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => app.security.unlockWithBiometrics(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: securityKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useChangePasscode(
  options?: Omit<UseMutationOptions<void, Error, { current: string; next: string }>, 'mutationFn'>,
) {
  const app = useFlamaApp();

  return useMutation({
    mutationFn: ({ current, next }) => app.security.changePasscode(current, next),
    ...options,
  });
}

/**
 * Returns a stable callback that locks the vault. Locking is synchronous (it
 * just drops the in-memory key and flips the store to `locked`); the lock-gate
 * then drives navigation to the unlock screen.
 */
export function useLock(): () => void {
  const app = useFlamaApp();
  return useCallback(() => app.security.lock(), [app]);
}

export function useEnableBiometrics(
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>,
) {
  const app = useFlamaApp();

  return useMutation({
    mutationFn: () => app.security.enableBiometrics(),
    ...options,
  });
}

export function useDisableBiometrics(
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>,
) {
  const app = useFlamaApp();

  return useMutation({
    mutationFn: () => app.security.disableBiometrics(),
    ...options,
  });
}

export function useSetAutoLockTimeout(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ms: number) => app.security.setAutoLockTimeout(ms),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: securityKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useWipeWallet(options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    // The whole teardown lives in the mutation: delete the vault, then settle
    // the wallet store to 'no_wallet' before onSuccess fires — otherwise a
    // navigation on success races the stale 'ready' wallet state back to Home.
    mutationFn: async () => {
      await app.security.wipe();
      await app.wallet.restore();
    },
    onSuccess: (...args) => {
      queryClient.removeQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: securityKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
