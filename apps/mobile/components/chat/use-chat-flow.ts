import * as React from 'react';
import { GREETING, newSession, SESSION_SEEDS } from './chat-seeds';
import type { ChatPayload, Msg, Session } from './types';

const RATE = 0.6184;
const XRPL_BAL = 1204.51;

/** Safe text accessor for the live session title/preview sync. */
function textOf(m: Msg): string | undefined {
  return 'text' in m ? m.text : undefined;
}

/**
 * Owns the Dewy conversation: the message thread, the seeded sessions, and the
 * scripted send / swap / balance flows. Money actions always become an explicit
 * approve/decline card — the flow never executes anything silently.
 */
export function useChatFlow() {
  const idRef = React.useRef(1);
  const flowRef = React.useRef<{
    name?: 'send' | 'swap';
    recipient?: string;
    amount?: number;
    network?: string;
    to?: string;
  }>({});
  const pendingRef = React.useRef<string | null>(null);

  const [sessions, setSessions] = React.useState<Session[]>(() => [
    {
      id: 'live',
      title: 'New chat',
      preview: 'Start a conversation',
      time: 'Now',
      group: 'Today',
      msgs: [GREETING],
    },
    ...SESSION_SEEDS,
  ]);
  const [activeId, setActiveId] = React.useState('live');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [msgs, setMsgs] = React.useState<Msg[]>([GREETING]);

  // Keep the active session in sync — live title, preview and messages.
  React.useEffect(() => {
    setSessions((list) =>
      list.map((s) => {
        if (s.id !== activeId) return s;
        const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
        const lastBot = [...msgs]
          .reverse()
          .find(
            (m) => m.role !== 'user' && 'kind' in m && (m.kind === 'text' || m.kind === 'result'),
          );
        return {
          ...s,
          title: lastUser ? (textOf(lastUser) ?? 'New chat').slice(0, 32) : 'New chat',
          preview: (lastBot && textOf(lastBot)) || s.preview,
          msgs,
        };
      }),
    );
  }, [msgs, activeId]);

  const loadSession = (id: string) => {
    setDrawerOpen(false);
    if (id === activeId) return;
    const target = sessions.find((s) => s.id === id);
    const tmsgs = target ? target.msgs : [GREETING];
    setMsgs(tmsgs);
    idRef.current = Math.max(0, ...tmsgs.map((m) => m.id)) + 1;
    flowRef.current = {};
    pendingRef.current = null;
    setActiveId(id);
  };

  const startNew = () => {
    const s = newSession();
    setSessions((list) => [s, ...list]);
    setMsgs([GREETING]);
    idRef.current = 1;
    flowRef.current = {};
    pendingRef.current = null;
    setActiveId(s.id);
    setDrawerOpen(false);
  };

  const add = (m: ChatPayload): number => {
    const id = idRef.current++;
    setMsgs((x) => [...x, { id, ...m } as Msg]);
    return id;
  };
  const remove = (id: number) => setMsgs((x) => x.filter((m) => m.id !== id));
  const update = (id: number, patch: Partial<Msg>) =>
    setMsgs((x) => x.map((m) => (m.id === id ? ({ ...m, ...patch } as Msg) : m)));
  const think = (then: () => void, d = 720) => {
    const id = add({ role: 'bot', kind: 'typing' });
    setTimeout(() => {
      remove(id);
      then();
    }, d);
  };

  /* ---- scripted flow steps ---- */
  const askAmount = () => {
    const who = (flowRef.current.recipient || 'Maria').split(' ')[0];
    add({
      role: 'bot',
      kind: 'text',
      text: `How much would you like to send to ${who}?`,
    });
    add({
      role: 'bot',
      kind: 'questions',
      qid: 'amount',
      title: 'Choose an amount',
      options: ['10 XRP', '25 XRP', '50 XRP', 'Custom'],
    });
  };
  const askNetwork = () => {
    add({ role: 'bot', kind: 'text', text: 'Which network should I use?' });
    add({
      role: 'bot',
      kind: 'questions',
      qid: 'network',
      title: 'Select network',
      options: ['XRP Ledger', 'XRPL EVM'],
    });
  };
  const review = () => {
    const f = flowRef.current;
    const usd = ((f.amount ?? 0) * RATE).toFixed(2);
    add({
      role: 'bot',
      kind: 'text',
      text: 'Here’s the payment — review and approve.',
    });
    add({
      role: 'bot',
      kind: 'action',
      actionKind: 'send',
      title: 'Send payment',
      status: 'pending',
      rows: [
        { label: 'To', value: f.recipient ?? 'Maria Gutiérrez', mono: true },
        {
          label: 'Amount',
          value: `${(f.amount ?? 0).toLocaleString('en-US')} XRP`,
          sub: `≈ $${usd}`,
        },
        { label: 'Network', value: f.network || 'XRP Ledger' },
        { label: 'Network fee', value: '0.00001 XRP' },
      ],
    });
  };
  const askSwapTo = () => {
    add({
      role: 'bot',
      kind: 'text',
      text: 'What would you like to swap into?',
    });
    add({
      role: 'bot',
      kind: 'questions',
      qid: 'swapTo',
      title: 'Receive',
      options: ['RLUSD', 'BTC', 'ETH'],
    });
  };
  const reviewSwap = () => {
    const f = flowRef.current;
    const usd = (f.amount ?? 0) * RATE;
    const div = f.to === 'BTC' ? 61240.5 : f.to === 'ETH' ? 2410.33 : 1.0008;
    add({
      role: 'bot',
      kind: 'text',
      text: 'Here’s your swap — review and approve.',
    });
    add({
      role: 'bot',
      kind: 'action',
      actionKind: 'swap',
      title: 'Swap tokens',
      status: 'pending',
      rows: [
        {
          label: 'From',
          value: `${(f.amount ?? 0).toLocaleString('en-US')} XRP`,
        },
        {
          label: 'To',
          value: `≈ ${(usd / div).toFixed(f.to === 'BTC' ? 6 : 2)} ${f.to}`,
        },
        { label: 'Rate', value: `1 XRP ≈ $${RATE.toFixed(4)}` },
        { label: 'Network fee', value: '0.00001 XRP' },
      ],
    });
  };
  const showBalance = () => {
    add({ role: 'bot', kind: 'text', text: 'Here’s your balance right now:' });
    add({
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
    });
  };

  const routeUser = (text: string) => {
    const lc = text.toLowerCase();
    if (pendingRef.current === 'amount') {
      const n = Number.parseFloat(text.replace(/[^0-9.]/g, ''));
      pendingRef.current = null;
      flowRef.current.amount = Number.isNaN(n) ? 25 : n;
      return think(flowRef.current.name === 'swap' ? askSwapTo : askNetwork);
    }
    if (/balance|how much do i|what.*have/.test(lc)) return think(showBalance);
    if (/swap|convert|exchange/.test(lc)) {
      flowRef.current = { name: 'swap' };
      return think(() => {
        add({
          role: 'bot',
          kind: 'text',
          text: 'Sure. How much XRP do you want to swap?',
        });
        add({
          role: 'bot',
          kind: 'questions',
          qid: 'amount',
          title: 'Choose an amount',
          options: ['10 XRP', '50 XRP', '100 XRP', 'Custom'],
        });
      });
    }
    if (/recipient|address|contact/.test(lc))
      return think(() =>
        add({
          role: 'bot',
          kind: 'text',
          text: 'Share the address (r… or 0x…) or scan a QR and I’ll save them as a recipient.',
        }),
      );
    const num = text.match(/([\d][\d,]*(?:\.\d+)?)\s*xrp/i);
    const nameM = text.match(/to\s+([A-Z][a-z]+)/);
    flowRef.current = {
      name: 'send',
      recipient: nameM ? nameM[1] : 'Maria Gutiérrez',
    };
    if (num) {
      flowRef.current.amount = Number.parseFloat(num[1].replace(/,/g, ''));
      return think(askNetwork);
    }
    return think(askAmount);
  };

  const onAnswer = (msg: Msg, opt: string) => {
    if ('answered' in msg && msg.answered) return;
    update(msg.id, { answered: opt } as Partial<Msg>);
    add({ role: 'user', text: opt });
    const qid = 'qid' in msg ? msg.qid : undefined;
    if (qid === 'amount') {
      if (opt === 'Custom') {
        pendingRef.current = 'amount';
        return think(() =>
          add({
            role: 'bot',
            kind: 'text',
            text: 'Sure — type the amount in the box below.',
          }),
        );
      }
      flowRef.current.amount = Number.parseFloat(opt);
      return think(flowRef.current.name === 'swap' ? askSwapTo : askNetwork);
    }
    if (qid === 'network') {
      flowRef.current.network = opt;
      return think(review);
    }
    if (qid === 'swapTo') {
      flowRef.current.to = opt;
      return think(reviewSwap);
    }
  };

  const onAction = (msg: Msg, approve: boolean) => {
    if (!('status' in msg) || msg.status !== 'pending') return;
    update(msg.id, {
      status: approve ? 'approved' : 'declined',
    } as Partial<Msg>);
    const f = flowRef.current;
    if (!approve)
      return think(() =>
        add({
          role: 'bot',
          kind: 'text',
          text: 'No problem — I’ve cancelled that. Anything else?',
        }),
      );
    const actionKind = 'actionKind' in msg ? msg.actionKind : undefined;
    if (actionKind === 'send' && (f.amount || 0) > XRPL_BAL) {
      return think(
        () =>
          add({
            role: 'bot',
            kind: 'error',
            title: 'Payment failed',
            text: `You don’t have enough XRP — your XRP Ledger balance is ${XRPL_BAL.toLocaleString(
              'en-US',
            )} XRP. Try a smaller amount.`,
          }),
        820,
      );
    }
    if (actionKind === 'swap')
      return think(() =>
        add({
          role: 'bot',
          kind: 'result',
          text: `Swapped ${(f.amount ?? 0).toLocaleString('en-US')} XRP to ${f.to}.`,
          meta: 'Settled on the XRP Ledger in 3.9s',
          tx: '0x4be1…77a2',
        }),
      );
    return think(() =>
      add({
        role: 'bot',
        kind: 'result',
        text: `Sent ${(f.amount ?? 0).toLocaleString('en-US')} XRP to ${
          (f.recipient || 'Maria').split(' ')[0]
        }.`,
        meta: 'Settled on the XRP Ledger in 3.7s · fee 0.00001 XRP',
        tx: '0x9f3c…a1b2',
      }),
    );
  };

  const onError = (msg: Msg, retry: boolean) => {
    if ('handled' in msg && msg.handled) return;
    update(msg.id, { handled: true } as Partial<Msg>);
    if (retry) {
      flowRef.current = {
        name: 'send',
        recipient: flowRef.current.recipient || 'Maria Gutiérrez',
      };
      return think(askAmount);
    }
    return think(() =>
      add({
        role: 'bot',
        kind: 'text',
        text: 'Okay, I’ve dropped that. Anything else?',
      }),
    );
  };

  /** Push a user message (chip or typed text) and route Dewy's reply. */
  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    add({ role: 'user', text: trimmed });
    routeUser(trimmed);
  };

  return {
    sessions,
    activeId,
    drawerOpen,
    setDrawerOpen,
    msgs,
    loadSession,
    startNew,
    submit,
    onAnswer,
    onAction,
    onError,
  };
}
