import type { LedgerTransaction, TxDirection } from '@flama/chain-core';
import { formatUnits } from '@flama/chain-core';
import type { Contact } from './address-book.state';

/**
 * The other party in a payment, resolved against the address book. When the
 * counterparty's address matches a saved contact we surface their name;
 * otherwise we fall back to a shortened address so the row still reads.
 */
export interface PaymentParty {
  /** Stable key for lists: the contact id, else the raw address. */
  key: string;
  /** Display name — contact name, or a shortened address. */
  name: string;
  /** Counterparty address, when the transaction exposed one. */
  address?: string;
  /** Set when the address resolved to a saved contact. */
  contactId?: string;
  /** Whether this party is in the address book. */
  known: boolean;
}

/** A transaction row enriched with the resolved counterparty, ready to render. */
export interface RecentPayment extends PaymentParty {
  /** Transaction hash; unique id for the row. */
  id: string;
  direction: TxDirection;
  /** Human-readable amount (e.g. 60 or 56.4), already scaled out of base units. */
  amount: number;
  symbol: string;
  /** Inclusion time in unix seconds. */
  timestamp: number;
  success: boolean;
  /** Network fee paid, scaled to native units; present on the payer's side. */
  fee?: number;
  /** Deep link to this transaction on the chain's block explorer. */
  explorerUrl?: string;
}

/** One entry on the people rail: a saved contact and/or a recent counterparty. */
export interface PaymentPerson extends PaymentParty {
  /** Most recent time we transacted with them, when known (unix seconds). */
  lastTimestamp?: number;
}

export interface PaymentsFeed {
  /** Enriched transaction history, newest first. */
  recents: RecentPayment[];
  /**
   * The people rail: saved contacts merged with everyone you've recently paid,
   * de-duplicated by address. Known contacts come first, then recent strangers.
   */
  people: PaymentPerson[];
}

export interface BuildPaymentsFeedOptions {
  /** Base-unit decimals for the moved asset (XRP drops = 6). */
  decimals: number;
}

/** Address comparison is case-insensitive and trims incidental whitespace. */
function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

/** Shorten an address for display: "rPT1…wXYZ". */
export function shortenAddress(address: string, lead = 5, tail = 4): string {
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

/**
 * Merge an account's transaction history with the address book into the two
 * lists the payments screen renders. Resolving counterparties to saved names is
 * the whole point of the address book, so it lives here as a pure function:
 * easy to unit-test and reusable by any surface that lists payments.
 */
export function buildPaymentsFeed(
  transactions: LedgerTransaction[],
  contacts: Contact[],
  options: BuildPaymentsFeedOptions,
): PaymentsFeed {
  // Index contacts by normalized address for O(1) resolution.
  const byAddress = new Map<string, Contact>();
  for (const contact of contacts) {
    byAddress.set(normalizeAddress(contact.address), contact);
  }

  const resolve = (address: string | undefined): PaymentParty => {
    if (!address) {
      return { key: 'unknown', name: 'Unknown', known: false };
    }
    const contact = byAddress.get(normalizeAddress(address));
    if (contact) {
      return {
        key: contact.id,
        name: contact.name,
        address,
        contactId: contact.id,
        known: true,
      };
    }
    return {
      key: address,
      name: shortenAddress(address),
      address,
      known: false,
    };
  };

  const recents: RecentPayment[] = transactions.map((tx) => {
    const party = resolve(tx.counterparty);
    return {
      ...party,
      id: tx.hash,
      direction: tx.direction,
      amount: Number(formatUnits(tx.amount, options.decimals)),
      symbol: tx.symbol,
      timestamp: tx.timestamp,
      success: tx.success,
      fee: tx.fee === undefined ? undefined : Number(formatUnits(tx.fee, options.decimals)),
      explorerUrl: tx.explorerUrl,
    };
  });

  // People rail: every saved contact, plus anyone recently transacted with.
  // Keyed by party.key so a contact and their transactions collapse into one.
  const people = new Map<string, PaymentPerson>();

  for (const contact of contacts) {
    people.set(contact.id, {
      key: contact.id,
      name: contact.name,
      address: contact.address,
      contactId: contact.id,
      known: true,
    });
  }

  for (const payment of recents) {
    if (!payment.address) continue;
    const existing = people.get(payment.key);
    if (existing) {
      // Track the most recent interaction for ordering.
      if (!existing.lastTimestamp || payment.timestamp > existing.lastTimestamp) {
        existing.lastTimestamp = payment.timestamp;
      }
      continue;
    }
    people.set(payment.key, {
      key: payment.key,
      name: payment.name,
      address: payment.address,
      contactId: payment.contactId,
      known: payment.known,
      lastTimestamp: payment.timestamp,
    });
  }

  const orderedPeople = [...people.values()].sort((a, b) => {
    // Known contacts first; within each bucket, most recently active first.
    if (a.known !== b.known) return a.known ? -1 : 1;
    return (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0);
  });

  return { recents, people: orderedPeople };
}
