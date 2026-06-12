import type { Msg, Session } from './types';

// Mocked Dewy data — the greeting, the seeded conversation history shown in the
// sessions drawer, and the composer quick-chips. No wallet wiring yet.

export const GREETING: Msg = {
  id: 0,
  role: 'bot',
  kind: 'text',
  text: 'Hi Jordan — I’m your wallet assistant. I can send or request XRP, swap tokens, check balances and add recipients. What would you like to do?',
};

/** Canned past conversations, each with its own full thread. */
export const SESSION_SEEDS: Session[] = [
  {
    id: 's-send',
    title: 'Send 25 XRP to Maria',
    preview: 'Sent 25 XRP to Maria.',
    time: '09:41',
    group: 'Today',
    msgs: [
      { id: 1, role: 'user', text: 'Send 25 XRP to Maria' },
      {
        id: 2,
        role: 'bot',
        kind: 'text',
        text: 'Here’s the payment — review and approve.',
      },
      {
        id: 3,
        role: 'bot',
        kind: 'action',
        actionKind: 'send',
        title: 'Send payment',
        status: 'approved',
        rows: [
          { label: 'To', value: 'Maria Gutiérrez', mono: true },
          { label: 'Amount', value: '25 XRP', sub: '≈ $15.46' },
          { label: 'Network', value: 'XRP Ledger' },
          { label: 'Network fee', value: '0.00001 XRP' },
        ],
      },
      {
        id: 4,
        role: 'bot',
        kind: 'result',
        text: 'Sent 25 XRP to Maria.',
        meta: 'Settled on the XRP Ledger in 3.7s · fee 0.00001 XRP',
        tx: '0x9f3c…a1b2',
      },
    ],
  },
  {
    id: 's-swap',
    title: 'Swap XRP → RLUSD',
    preview: 'Swapped 100 XRP to RLUSD.',
    time: '08:12',
    group: 'Today',
    msgs: [
      { id: 1, role: 'user', text: 'Swap 100 XRP to RLUSD' },
      {
        id: 2,
        role: 'bot',
        kind: 'text',
        text: 'Here’s your swap — review and approve.',
      },
      {
        id: 3,
        role: 'bot',
        kind: 'action',
        actionKind: 'swap',
        title: 'Swap tokens',
        status: 'approved',
        rows: [
          { label: 'From', value: '100 XRP' },
          { label: 'To', value: '≈ 61.79 RLUSD' },
          { label: 'Rate', value: '1 XRP ≈ $0.6184' },
          { label: 'Network fee', value: '0.00001 XRP' },
        ],
      },
      {
        id: 4,
        role: 'bot',
        kind: 'result',
        text: 'Swapped 100 XRP to RLUSD.',
        meta: 'Settled on the XRP Ledger in 3.9s',
        tx: '0x4be1…77a2',
      },
    ],
  },
  {
    id: 's-bal',
    title: 'Balance check',
    preview: 'Here’s your balance right now.',
    time: 'Yesterday',
    group: 'Earlier',
    msgs: [
      { id: 1, role: 'user', text: 'How much do I have?' },
      {
        id: 2,
        role: 'bot',
        kind: 'text',
        text: 'Here’s your balance right now:',
      },
      {
        id: 3,
        role: 'bot',
        kind: 'balance',
        total: 942.76,
        rows: [
          {
            symbol: 'XRP',
            name: 'XRP Ledger',
            xrp: 1204.51,
            usd: 744.87,
            color: '#14161a',
          },
          {
            symbol: 'XRP',
            name: 'XRPL EVM',
            xrp: 320,
            usd: 197.89,
            color: '#5b41dd',
          },
        ],
      },
    ],
  },
  {
    id: 's-recip',
    title: 'Add a recipient',
    preview: 'Share the address or scan a QR…',
    time: 'Mon',
    group: 'Earlier',
    msgs: [
      { id: 1, role: 'user', text: 'Add a recipient' },
      {
        id: 2,
        role: 'bot',
        kind: 'text',
        text: 'Share the address (r… or 0x…) or scan a QR and I’ll save them as a recipient.',
      },
    ],
  },
];

// The composer quick-chips, matching the design (chat-app.jsx) minus the
// "Add a contact" chip — the address-book flow is intentionally out of scope.
export const CHIPS = ['Send to Maria', 'Check my balance', 'Swap XRP → RLUSD'];

/** A fresh, empty conversation for the "New chat" action. */
export function newSession(): Session {
  return {
    id: `new-${Date.now()}`,
    title: 'New chat',
    preview: 'Start a conversation',
    time: 'Now',
    group: 'Today',
    msgs: [GREETING],
  };
}
