import { type RecentPayment, usePaymentsFeed, useWalletState } from '@flama/frontend/react';
import * as React from 'react';

/** Default chain when no wallet is loaded yet, so the section still renders. */
const FALLBACK_CHAIN_ID = 'xrpl:testnet';

/** How many recent transactions the home Activity card shows before "See all". */
export const HOME_ACTIVITY_LIMIT = 4;

export type UseHomeActivity = {
  /** Newest transactions, capped to {@link HOME_ACTIVITY_LIMIT}. */
  recents: RecentPayment[];
  /** True while the first page of history is still loading. */
  isLoading: boolean;
};

/**
 * The home Activity feed — the same merged transaction history that powers the
 * payments "Recent" card ({@link usePaymentsFeed}), capped to the most recent
 * few for an at-a-glance hub view. The history is joined with the on-device
 * address book so each row carries a saved name where one exists.
 */
export function useHomeActivity(limit: number = HOME_ACTIVITY_LIMIT): UseHomeActivity {
  const { accounts } = useWalletState();

  // The hub's activity is XRP-denominated; track the active wallet's XRPL account.
  const xrpl = accounts.find((account) => account.kind === 'xrpl');
  const { recents, isLoading } = usePaymentsFeed(xrpl?.chainId ?? FALLBACK_CHAIN_ID, xrpl?.address);

  const capped = React.useMemo(() => recents.slice(0, limit), [recents, limit]);

  return { recents: capped, isLoading };
}
