// Send-screen data — the paying account comes from the wallet domain
// (`useWalletState().accounts`) and the recipient from the address-book domain
// (`useContacts()`), each mapped onto a presentational shape. Pure
// mapping/formatting only — no React, no domain calls.

import type { Contact, WalletAccount } from '@flama/frontend';

/**
 * Who the payment is going to. `address` (+ `chainId`) is what the broadcast
 * actually pays; it comes from a saved address-book contact, an explicit param,
 * or the demo peer. `destinationTag` is carried for XRPL recipients that need it.
 */
export type SendRecipient = {
  name: string;
  handle: string | null;
  /** Classic address the broadcast pays; null when no payable target is known. */
  address: string | null;
  /** Chain the address belongs to (e.g. "xrpl:testnet"); null when unknown. */
  chainId: string | null;
  /** XRPL destination tag, when the recipient requires one. */
  destinationTag: string | null;
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
  chainId: null,
  destinationTag: null,
};

/** Map a saved address-book contact onto the recipient the Send flow pays. */
export function toRecipientFromContact(contact: Contact, handle?: string | null): SendRecipient {
  return {
    name: contact.name,
    handle: handle ?? null,
    address: contact.address,
    chainId: contact.chainId,
    destinationTag: contact.destinationTag ?? null,
  };
}

/**
 * Resolve the recipient from route params, falling back to the demo peer. An
 * explicit `address` is honoured as-is; otherwise we keep the demo's payable
 * address so the flow stays walkable while still showing the passed identity.
 */
export function toRecipient(params: {
  name?: string;
  handle?: string;
  address?: string;
}): SendRecipient {
  if (!params.name && !params.handle && !params.address) return DEMO_RECIPIENT;
  return {
    name: params.name ?? DEMO_RECIPIENT.name,
    handle: params.handle ?? null,
    address: params.address ?? DEMO_RECIPIENT.address,
    chainId: null,
    destinationTag: null,
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
