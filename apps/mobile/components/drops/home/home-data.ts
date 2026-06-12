// Home-screen view models + formatters.
//
// Account balances are now live: `use-home.ts` reads the active wallet's
// per-chain accounts (`useWalletState().accounts`), their on-chain balances
// (`useChainBalances`) and USD prices (`useMarkets`), and shapes them into the
// `HomeAccount` view models the tiles render. Recent activity is also live —
// `use-home-activity.ts` reuses the payments feed (`usePaymentsFeed`).

import type { WalletAccount } from '@flama/frontend';

/** Fallback XRP → USD rate used by the legacy payments-chat view models. */
export const XRP_USD_RATE = 0.6184;

export type ChainBadgeKind =
  | { kind: 'xrp' }
  | { kind: 'evm' }
  | { kind: 'letter'; color: string; label: string };

export type HomeAccount = {
  id: string;
  name: string;
  /** Balance in the account's native unit (e.g. XRP). */
  amount: number;
  unit: string;
  /** Fiat value of the balance, already converted to USD. */
  usd: number;
  badge: ChainBadgeKind;
};

/** Maps a chain kind onto the home tile's badge descriptor. */
export function badgeForChainKind(kind: WalletAccount['kind']): ChainBadgeKind {
  return kind === 'xrpl' ? { kind: 'xrp' } : { kind: 'evm' };
}

/** Total fiat across every account — the balance hero figure. */
export function totalUsd(accounts: HomeAccount[]): number {
  return accounts.reduce((sum, account) => sum + account.usd, 0);
}

export function formatUsd(value: number): string {
  return `$${Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatXrp(value: number): string {
  return Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
