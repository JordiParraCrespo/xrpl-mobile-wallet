'use client';

import type { AccountTxQuery } from '@flama/chain-core';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Query-key factories shared across the React hooks. They live in this leaf
 * module (no imports from the `*.queries` files) so mutations in one domain can
 * invalidate read-models in another without the query files importing each
 * other in a cycle.
 */

export const walletKeys = {
  all: ['wallet'] as const,
  restore: ['wallet', 'restore'] as const,
  balance: (chainId: string) => ['wallet', 'balance', chainId] as const,
};

export const tokensKeys = {
  all: ['tokens'] as const,
  list: (chainId: string) => ['tokens', 'list', chainId] as const,
  balance: (chainId: string, issuer: string, symbol: string) =>
    ['tokens', 'balance', chainId, issuer, symbol] as const,
};

export const explorerKeys = {
  all: ['explorer'] as const,
  blocks: (chainId: string) => ['explorer', 'blocks', chainId] as const,
  accountTx: (chainId: string, address: string, query?: AccountTxQuery) =>
    ['explorer', 'accountTx', chainId, address, query ?? null] as const,
};

/**
 * Invalidate every read-model a money movement affects: native balances, token
 * balances, and the activity feed. A transfer changes the native balance (the
 * fee, and on XRPL the reserve), any moved token's balance, and adds a row to
 * history — and those live under three separate key namespaces, so a mutation
 * scoped to its own namespace would leave the others stale. Broad by design:
 * the cost is a few refetches, the alternative is showing stale money.
 */
export function invalidateAfterTransfer(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: walletKeys.all });
  queryClient.invalidateQueries({ queryKey: tokensKeys.all });
  queryClient.invalidateQueries({ queryKey: explorerKeys.all });
}
