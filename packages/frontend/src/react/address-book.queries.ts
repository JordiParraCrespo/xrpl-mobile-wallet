'use client';

import type { AccountTxQuery } from '@flama/chain-core';
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  type AddContactInput,
  buildPaymentsFeed,
  type Contact,
  type PaymentsFeed,
} from '../modules/address-book';
import { useFlamaApp } from './context';
import { useAccountTransactions } from './explorer.queries';
import { useAddressBookState } from './hooks';
import { addressBookKeys } from './query-keys';

export { addressBookKeys } from './query-keys';

/**
 * XRPL holds native balances in drops — 1 XRP = 1,000,000 drops. The payments
 * feed is XRP-denominated, so amounts scale out of base units by 6 decimals.
 */
const XRP_DROPS_DECIMALS = 6;

/** Loads the persisted contacts into the address-book store on startup. */
export function useAddressBookRestore(
  options?: Omit<UseQueryOptions<null, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: addressBookKeys.restore,
    queryFn: async () => {
      await app.addressBook.restore();
      return null;
    },
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
    ...options,
  });
}

/** The saved contacts, read straight from the store (newest first). */
export function useContacts(): Contact[] {
  return useAddressBookState().contacts;
}

/** Saves a new recipient to the address book. */
export function useAddContact(
  options?: Omit<UseMutationOptions<Contact, Error, AddContactInput>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddContactInput) => app.addressBook.addContact(input),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: addressBookKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/** Removes a saved recipient by id. */
export function useRemoveContact(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) {
  const app = useFlamaApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => app.addressBook.removeContact(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: addressBookKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export interface UsePaymentsFeedResult extends PaymentsFeed {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * The merged data behind the payments screen: an account's transaction history
 * (from the `explorer` module) joined with the address book so each row and
 * person carries a saved name where one exists. Pass the active wallet's XRPL
 * `chainId`/`address`; the merge runs client-side and refreshes whenever either
 * source changes.
 */
export function usePaymentsFeed(
  chainId: string,
  address: string | undefined,
  query?: AccountTxQuery,
): UsePaymentsFeedResult {
  const contacts = useContacts();
  const txQuery = useAccountTransactions(chainId, address, query);

  const transactions = txQuery.data?.transactions ?? [];
  const { recents, people } = buildPaymentsFeed(transactions, contacts, {
    decimals: XRP_DROPS_DECIMALS,
  });

  return {
    recents,
    people,
    isLoading: txQuery.isLoading,
    isError: txQuery.isError,
    error: txQuery.error,
  };
}
