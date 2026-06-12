// Home-screen view models + formatters.
//
// Account balances are now live: `use-home.ts` reads the active wallet's
// per-chain accounts (`useWalletState().accounts`), their on-chain balances
// (`useChainBalances`) and USD prices (`useMarkets`), and shapes them into the
// `HomeAccount` view models the tiles render. Recent activity is still mocked
// (the explorer history feed is a follow-up); `XRP_USD_RATE` derives its fiat.

import type { WalletAccount } from '@flama/frontend';

/** Fallback XRP → USD rate for the still-mocked activity feed. */
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

export type HomeActivity = {
  id: string;
  kind: 'in' | 'out' | 'pending';
  name: string;
  sub: string;
  xrp: number;
  time: string;
  media: { avatar: string } | { glyph: 'coffee' } | { asset: string };
};

/** Maps a chain kind onto the home tile's badge descriptor. */
export function badgeForChainKind(kind: WalletAccount['kind']): ChainBadgeKind {
  return kind === 'xrpl' ? { kind: 'xrp' } : { kind: 'evm' };
}

export const HOME_ACTIVITY: HomeActivity[] = [
  {
    id: '1',
    kind: 'in',
    name: 'Maria Gutiérrez',
    sub: 'Received',
    xrp: 60,
    time: '2h ago',
    media: { avatar: 'Maria Gutiérrez' },
  },
  {
    id: '2',
    kind: 'out',
    name: 'Coffee Collective',
    sub: 'Card payment',
    xrp: 4.2,
    time: '5h ago',
    media: { glyph: 'coffee' },
  },
  {
    id: '3',
    kind: 'pending',
    name: 'Swap to RLUSD',
    sub: 'Swapping',
    xrp: 100,
    time: 'Just now',
    media: { asset: 'RLUSD' },
  },
];

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
