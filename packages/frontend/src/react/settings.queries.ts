'use client';

import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { AppearanceMode } from '../modules/settings';
import { useFlamaApp } from './context';

export const settingsKeys = {
  all: ['settings'] as const,
  restore: ['settings', 'restore'] as const,
};

/** Loads the persisted app preferences into the settings store on startup. */
export function useSettingsRestore(
  options?: Omit<UseQueryOptions<null, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: settingsKeys.restore,
    queryFn: async () => {
      await app.settings.restore();
      return null;
    },
    retry: false,
    staleTime: Infinity,
    ...options,
  });
}

/** Persists the fiat currency balances are displayed in. */
export function useSetDisplayCurrency(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => app.settings.setDisplayCurrency(code),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/** Persists the appearance (color scheme) preference. */
export function useSetAppearance(
  options?: Omit<UseMutationOptions<void, Error, AppearanceMode>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mode: AppearanceMode) => app.settings.setAppearance(mode),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/** Persists the notification opt-in flag. */
export function useSetNotificationsEnabled(
  options?: Omit<UseMutationOptions<void, Error, boolean>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => app.settings.setNotificationsEnabled(enabled),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
