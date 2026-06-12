// Send-screen data — the paying account comes from the wallet domain
// (`useWalletState().accounts`), mapped onto the presentational `SendAccount`;
// the recipient comes from the route (a payment chat), with a demo peer as the
// walkable fallback. Pure mapping/formatting only — no React, no domain calls.

import type { WalletAccount } from '@flama/frontend';

/** Who the payment is going to — passed in via route params from a chat. */
export type SendRecipient = {
  name: string;
  handle: string | null;
  /** Classic address the broadcast pays; null when only a demo peer is known. */
  address: string | null;
};

/** The paying account, projected from a domain `WalletAccount`. */
export type SendAccount = {
  chainId: string;
  symbol: string;
  /** Wallet name (e.g. "Personal"), shown on the From pill. */
  label: string;
  address: string;
  network: string;
};

// Mirrors the design's reference peer so the flow is fully walkable when opened
// without a recipient. The address is a well-known XRPL account, so a broadcast
// has a real target rather than a placeholder that can never settle.
export const DEMO_RECIPIENT: SendRecipient = {
  name: 'Maria Gutiérrez',
  handle: '@mariawvv2',
  address: 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY',
};

/** Resolve the recipient from (partial) route params, falling back to the demo. */
export function toRecipient(params: {
  name?: string;
  handle?: string;
  address?: string;
}): SendRecipient {
  if (!params.name && !params.handle && !params.address) return DEMO_RECIPIENT;
  return {
    name: params.name ?? DEMO_RECIPIENT.name,
    handle: params.handle ?? null,
    address: params.address ?? null,
  };
}

/** Map a domain wallet account onto the shape the Send screen renders. */
export function toSendAccount(account: WalletAccount, walletName: string): SendAccount {
  return {
    chainId: account.chainId,
    symbol: account.symbol,
    label: walletName,
    address: account.address,
    network: account.chainName,
  };
}

/** "$1,234.56" — the fiat figure shown for amounts and balances. */
export function fmtUsd(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "16.17" — a human XRP amount (trimmed), used for the ≈ line and the broadcast. */
export function fmtXrp(n: number, maximumFractionDigits = 6): string {
  return n.toLocaleString('en-US', { maximumFractionDigits });
}
