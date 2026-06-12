// Mocked home-screen data — mirrors the Drops design handoff
// (`home/home-parts.jsx`: H_RATE, H_NETWORKS, H_ACTIVITY). Stand-in
// numbers until the wallet + explorer modules feed real balances and
// activity. Two networks sum to the $942.76 hero in the design.

/** XRP → USD, the single rate the mocked fiat figures are derived from. */
export const XRP_USD_RATE = 0.6184;

export type ChainBadgeKind =
  | { kind: 'xrp' }
  | { kind: 'evm' }
  | { kind: 'letter'; color: string; label: string };

export type HomeAccount = {
  id: string;
  name: string;
  /** Balance in the account's native unit (XRP unless `unit` says otherwise). */
  amount: number;
  unit: string;
  /** USD per unit; defaults to the XRP rate when omitted. */
  rate?: number;
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

export const HOME_ACCOUNTS: HomeAccount[] = [
  {
    id: 'xrpl',
    name: 'XRP Ledger',
    amount: 1204.5072,
    unit: 'XRP',
    badge: { kind: 'xrp' },
  },
  {
    id: 'evm',
    name: 'XRPL EVM',
    amount: 320,
    unit: 'XRP',
    badge: { kind: 'evm' },
  },
];

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

/** USD value of an account, honoring a non-XRP rate when present. */
export function accountUsd(account: HomeAccount): number {
  return account.amount * (account.rate ?? XRP_USD_RATE);
}

/** Total fiat across every account — the balance hero figure. */
export function totalUsd(accounts: HomeAccount[]): number {
  return accounts.reduce((sum, a) => sum + accountUsd(a), 0);
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
