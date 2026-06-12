'use client';

import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useFlamaApp } from './context';

export const profileKeys = {
  all: ['profile'] as const,
  restore: ['profile', 'restore'] as const,
};

/** Loads the persisted display name into the profile store on startup. */
export function useProfileRestore(
  options?: Omit<UseQueryOptions<null, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: profileKeys.restore,
    queryFn: async () => {
      await app.profile.restore();
      return null;
    },
    retry: false,
    staleTime: Infinity,
    ...options,
  });
}

/** Persists the display name to the device and updates the store. */
export function useSetDisplayName(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => app.profile.setName(name),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
