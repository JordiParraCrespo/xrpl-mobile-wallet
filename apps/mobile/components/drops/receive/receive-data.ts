// Receive-screen data — the per-chain receiving accounts come from the wallet
// domain (`useWalletState().accounts`); this module maps a domain
// `WalletAccount` onto the presentational `ReceiveAccount` the screen renders.

import type { WalletAccount } from '@flama/frontend';

export type ReceiveAccount = {
  symbol: string;
  name: string;
  /** AssetIcon disc color for the account pill. */
  color: string;
  address: string;
  /** Surfaced only for XRPL accounts that require one (a common footgun). */
  tag: string | null;
  network: string;
  /** Keeps the faux QR module grid stable per account. */
  seed: number;
};

// XRP black for the Ledger, brand indigo for the EVM sidechain — mirrors the
// AssetIcon defaults and the design's account pills.
function chainColor(kind: WalletAccount['kind']): string {
  return kind === 'evm' ? '#5b41dd' : '#14161a';
}

// A stable, address-derived seed so each account's faux QR pattern is
// deterministic (and distinct between chains) without a real encoder.
function seedFromAddress(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) & 0x7fffffff;
  }
  return hash || 1;
}

/** Map a domain wallet account onto the shape the Receive screen renders. */
export function toReceiveAccount(account: WalletAccount): ReceiveAccount {
  return {
    symbol: account.symbol,
    name: account.chainName,
    color: chainColor(account.kind),
    address: account.address,
    // Receiving to your own classic address needs no destination tag; the
    // domain doesn't issue one, so it stays hidden.
    tag: null,
    network: account.chainName,
    seed: seedFromAddress(account.address),
  };
}

// The money flows are immersive dark surfaces. We pin the dark design tokens on
// the screen subtree via `vars()` so every `@flama/design-system-mobile`
// primitive (Card, Button, Callout, …) resolves white-on-dark regardless of the
// system theme — the same approach the gradient Home uses. Values mirror the
// `.dark:root` block in `apps/mobile/global.css`.
export const FLOW_DARK_VARS = {
  '--background': '220 16.7% 7.1%',
  '--foreground': '240 10% 96.1%',
  '--card': '220 13% 9%',
  '--card-foreground': '240 10% 96.1%',
  '--popover': '220 13% 9%',
  '--popover-foreground': '240 10% 96.1%',
  '--primary': '0 0% 100%',
  '--primary-foreground': '220 13% 9%',
  '--secondary': '218 11.4% 13.7%',
  '--secondary-foreground': '240 10% 96.1%',
  '--muted': '218 11.4% 13.7%',
  '--muted-foreground': '208 8.1% 58.6%',
  '--accent': '218 11.4% 13.7%',
  '--accent-foreground': '240 10% 96.1%',
  '--destructive': '358 85.1% 60.4%',
  '--destructive-foreground': '0 0% 100%',
  '--destructive-soft': '0 50% 14%',
  '--destructive-soft-foreground': '358 85% 78%',
  '--border': '218 11.4% 13.7%',
  '--input': '218 11.4% 13.7%',
  '--ring': '249 80.6% 71.8%',
  '--radius': '1.25rem',
  '--brand': '249 77.5% 63.3%',
  '--brand-foreground': '0 0% 100%',
  '--brand-soft': '250 40% 17%',
  '--brand-soft-foreground': '248 85.5% 89.2%',
  '--positive': '162 82.2% 39.6%',
  '--positive-foreground': '0 0% 100%',
  '--positive-soft': '162 60% 11%',
  '--positive-soft-foreground': '155 52% 78%',
  '--warning': '39 100% 48%',
  '--warning-foreground': '0 0% 100%',
  '--warning-soft': '39 70% 12%',
  '--warning-soft-foreground': '37 95% 75%',
  '--info': '217 89.9% 61%',
  '--info-foreground': '0 0% 100%',
  '--info-soft': '217 60% 14%',
  '--info-soft-foreground': '215 90% 80%',
  '--inverse': '0 0% 100%',
  '--inverse-foreground': '220 13% 9%',
} as const;
