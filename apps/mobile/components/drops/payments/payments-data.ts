// Mocked payment-chat data — mirrors the Drops design handoff
// (`payments/payments-screens.jsx`: PAY_CHAT, TxDetailSheet). Stand-in
// thread and transaction details until the wallet + explorer modules feed
// real payments. The XRP→USD rate and the fiat/XRP formatters are the same
// ones the Home screen derives its figures from, so every screen agrees.

import { formatUsd, formatXrp, XRP_USD_RATE } from '../home/home-data';

export { formatUsd, formatXrp, XRP_USD_RATE };

export type PaymentDirection = 'in' | 'out';

/** A single settled payment between you and a contact. */
export type PaymentTransaction = {
  id: string;
  dir: PaymentDirection;
  /** Amount in XRP (always positive; `dir` carries the sign). */
  xrp: number;
  /** Free-text memo the sender attached. */
  note: string;
  /** Wall-clock time shown on the bubble, e.g. `17:31`. */
  time: string;
  /** Long date shown in the detail, e.g. `14 May 2026`. */
  date: string;
  /** Truncated transaction hash, e.g. `0x7a3f…91c2`. */
  hash: string;
  ledger: number;
  /** Network fee in XRP. */
  fee: number;
  /** Ledger submit / validate timestamps (mono). */
  submitted: string;
  validated: string;
  /** Default counterparty when opened without a chat context. */
  peer: string;
};

/** A chat thread is a flat list of date separators and money bubbles. */
export type ThreadEntry = { type: 'date'; label: string } | { type: 'tx'; tx: PaymentTransaction };

export type PaymentContact = {
  slug: string;
  name: string;
  /** XRPL pay handle shown under the name in the chat header. */
  handle: string;
};

const CONTACTS: Record<string, PaymentContact> = {
  maria: { slug: 'maria', name: 'Maria Gutiérrez', handle: '@mariaxrpl' },
  ernest: { slug: 'ernest', name: 'Ernest Terré', handle: '@ernestxrpl' },
  yazid: { slug: 'yazid', name: 'Yazid Desfandi', handle: '@yazidxrpl' },
  candra: { slug: 'candra', name: 'Candra Halim', handle: '@candraxrpl' },
};

/**
 * Resolve a contact slug to its display identity. Unknown slugs fall back to a
 * title-cased name and a derived handle, so deep links never dead-end.
 */
export function getContact(slug: string | undefined): PaymentContact {
  if (slug && CONTACTS[slug]) return CONTACTS[slug];
  const name = (slug ?? 'recipient')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => (part[0] ?? '').toUpperCase() + part.slice(1))
    .join(' ');
  const key = (slug ?? 'recipient').replace(/[^a-z0-9]/gi, '').toLowerCase();
  return {
    slug: slug ?? 'recipient',
    name: name || 'Recipient',
    handle: `@${key}xrpl`,
  };
}

// Keyed transaction store — the chat thread and the detail screen read the same
// objects, so a bubble and the screen it opens can never drift apart.
const TRANSACTIONS: Record<string, PaymentTransaction> = {
  'tx-1': {
    id: 'tx-1',
    dir: 'in',
    xrp: 14.5,
    note: 'Dinner split',
    time: '17:31',
    date: '14 May 2026',
    hash: '0x7a3f…91c2',
    ledger: 86421907,
    fee: 0.00001,
    submitted: '17:31:02',
    validated: '17:31:06',
    peer: 'Maria Gutiérrez',
  },
  'tx-2': {
    id: 'tx-2',
    dir: 'out',
    xrp: 85,
    note: 'Ikea',
    time: '21:33',
    date: '17 May 2026',
    hash: '0x2bd0…4e7a',
    ledger: 86458231,
    fee: 0.00001,
    submitted: '21:33:40',
    validated: '21:33:44',
    peer: 'Maria Gutiérrez',
  },
  'tx-3': {
    id: 'tx-3',
    dir: 'in',
    xrp: 7.8,
    note: 'Nochecita Venecia',
    time: '14:10',
    date: '5 Jun 2026',
    hash: '0x9f12…aa31',
    ledger: 86701554,
    fee: 0.00001,
    submitted: '14:10:18',
    validated: '14:10:22',
    peer: 'Maria Gutiérrez',
  },
  'tx-4': {
    id: 'tx-4',
    dir: 'in',
    xrp: 60,
    note: 'Nasson Moretti',
    time: '15:57',
    date: '7 Jun 2026',
    hash: '0x4be1…77a2',
    ledger: 86724890,
    fee: 0.00001,
    submitted: '15:57:09',
    validated: '15:57:13',
    peer: 'Maria Gutiérrez',
  },
};

/** The mocked conversation, newest at the bottom (chat reading order). */
export const PAYMENT_THREAD: ThreadEntry[] = [
  { type: 'date', label: '14 May' },
  { type: 'tx', tx: TRANSACTIONS['tx-1'] },
  { type: 'date', label: '17 May' },
  { type: 'tx', tx: TRANSACTIONS['tx-2'] },
  { type: 'date', label: '5 Jun' },
  { type: 'tx', tx: TRANSACTIONS['tx-3'] },
  { type: 'date', label: '7 Jun' },
  { type: 'tx', tx: TRANSACTIONS['tx-4'] },
];

/** Look up a transaction by id, falling back to the first mock entry. */
export function getTransaction(id: string | undefined): PaymentTransaction {
  return (id && TRANSACTIONS[id]) || TRANSACTIONS['tx-1'];
}
