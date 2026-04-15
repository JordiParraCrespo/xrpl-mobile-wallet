'use client';

import type { UpdateUserDto } from '@flama/shared';
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { UserEntity } from '../modules/users/user.entity';
import { useFlamaApp } from './context';

export const usersKeys = {
  all: ['users'] as const,
  list: (page?: number, pageSize?: number) => ['users', 'list', { page, pageSize }] as const,
  detail: (id: string) => ['users', id] as const,
  me: ['users', 'me'] as const,
};

export const profileQueryKey = usersKeys.me;

export function useProfile(
  options?: Omit<UseQueryOptions<UserEntity, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: usersKeys.me,
    queryFn: () => app.users.me(),
    ...options,
  });
}

export function useUsers(
  page = 1,
  pageSize = 20,
  options?: Omit<UseQueryOptions<UserEntity[], Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: usersKeys.list(page, pageSize),
    queryFn: () => app.users.findAll(page, pageSize),
    ...options,
  });
}

export function useUser(
  id: string,
  options?: Omit<UseQueryOptions<UserEntity, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => app.users.findById(id),
    enabled: !!id,
    ...options,
  });
}

export function useUpdateUser(
  options?: Omit<
    UseMutationOptions<UserEntity, Error, { id: string; dto: UpdateUserDto }>,
    'mutationFn'
  >,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) => app.users.update(id, dto),
    onSuccess: (...args) => {
      queryClient.setQueryData(usersKeys.detail(args[1].id), args[0]);
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useDeleteUser(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => app.users.delete(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
