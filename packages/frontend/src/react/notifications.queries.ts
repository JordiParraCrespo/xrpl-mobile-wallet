'use client';

import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { WalletNotification } from '../modules/notifications';
import { useFlamaApp } from './context';

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
};

export function useNotifications(
  options?: Omit<UseQueryOptions<WalletNotification[], Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: notificationsKeys.list,
    queryFn: () => app.notifications.list(),
    ...options,
  });
}

export function useMarkAllNotificationsRead(
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => app.notifications.markAllRead(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
