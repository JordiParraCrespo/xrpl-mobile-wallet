import { useProfileState } from '@flama/frontend/react';
import type { ApproveFn, WalletAgent } from '@flama/wallet-agent';
import * as React from 'react';
import { createWalletAgent } from '../../lib/agent';
import { greeting, newSession, SESSION_SEEDS } from './chat-seeds';
import type { ChatPayload, Msg, Session } from './types';

const RATE = 0.6184;
const XRPL_BAL = 1204.51;

/** Matches an XRPL classic r-address anywhere in a message. */
const XRPL_ADDRESS = /\br[1-9A-HJ-NP-Za-km-z]{24,34}\b/;
/** "raHZ…w9r" — a compact, readable label for a raw address. */
const shortAddress = (a: string): string => `${a.slice(0, 6)}…${a.slice(-4)}`;

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
  const { name: profileName } = useProfileState();
  const idRef = React.useRef(1);
  const flowRef = React.useRef<{
    name?: 'send' | 'swap';
    /** Display label for the recipient (a saved name or a shortened address). */
    recipient?: string;
    /** The real XRPL destination address, when the user supplied one. */
    recipientAddress?: string;
    amount?: number;
    network?: string;
    to?: string;
  }>({});
  const pendingRef = React.useRef<string | null>(null);
  const agentRef = React.useRef<WalletAgent | null>(null);
  /** The single in-flight bot "typing" bubble, so the approval card can pause it. */
  const typingRef = React.useRef<number | null>(null);
  /** Resolver for the pending payment approval card (set while the agent waits). */
  const approvalRef = React.useRef<{
    id: number;
    resolve: (ok: boolean) => void;
  } | null>(null);

  /**
   * Approval gate handed to the agent: renders a send action card and resolves
   * only when the user taps approve/decline. The agent signs + submits on-device
   * *after* this resolves true — funds never move without an explicit tap.
   */
  const requestApproval: ApproveFn = (request) => {
    stopTyping();
    const input = request.input as {
      destination?: unknown;
      amount?: unknown;
      destinationTag?: unknown;
      memo?: unknown;
    };
    const rows: { label: string; value: string; mono?: boolean }[] = [
      { label: 'To', value: String(input.destination ?? ''), mono: true },
      { label: 'Amount', value: `${String(input.amount ?? '')} XRP` },
    ];
    if (input.destinationTag !== undefined) {
      rows.push({
        label: 'Destination tag',
        value: String(input.destinationTag),
      });
    }
    if (input.memo) {
      rows.push({ label: 'Memo', value: String(input.memo) });
    }
    const id = add({
      role: 'bot',
      kind: 'action',
      actionKind: 'send',
      title: 'Send payment',
      status: 'pending',
      rows,
    });
    return new Promise<boolean>((resolve) => {
      approvalRef.current = { id, resolve };
    });
  };

  /**
   * The on-device wallet agent (Claude + the XRPL tool loop), built lazily on
   * first use. Reads (balance, ledgers) run freely; submitting a payment goes
   * through {@link requestApproval}, so it always needs an explicit tap.
   */
  const getAgent = (): WalletAgent => {
    if (!agentRef.current) {
      agentRef.current = createWalletAgent({ approve: requestApproval });
    }
    return agentRef.current;
  };

  /**
   * Drives a turn through the real on-chain agent — balances, ledgers, and
   * payments (which pause on an approval card mid-loop). Renders the final reply.
   */
  const runAgent = async (text: string) => {
    startTyping();
    try {
      const reply = await getAgent().ask(text);
      stopTyping();
      if (reply.trim()) {
        add({ role: 'bot', kind: 'text', text: reply });
      }
    } catch (error) {
      stopTyping();
      add({
        role: 'bot',
        kind: 'error',
        title: 'Something went wrong',
        text: error instanceof Error ? error.message : 'Please try again in a moment.',
      });
    }
  };

  const [sessions, setSessions] = React.useState<Session[]>(() => [
    {
      id: 'live',
      title: 'New chat',
      preview: 'Start a conversation',
      time: 'Now',
      group: 'Today',
      msgs: [greeting(profileName)],
    },
    ...SESSION_SEEDS,
  ]);
  const [activeId, setActiveId] = React.useState('live');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [msgs, setMsgs] = React.useState<Msg[]>([greeting(profileName)]);

  // Personalize the opening greeting once the profile name loads (if the live
  // thread is still just the greeting).
  React.useEffect(() => {
    if (!profileName) return;
    setMsgs((cur) => (cur.length === 1 && cur[0]?.id === 0 ? [greeting(profileName)] : cur));
  }, [profileName]);

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
    const tmsgs = target ? target.msgs : [greeting(profileName)];
    setMsgs(tmsgs);
    idRef.current = Math.max(0, ...tmsgs.map((m) => m.id)) + 1;
    flowRef.current = {};
    pendingRef.current = null;
    setActiveId(id);
  };

  const startNew = () => {
    const s = newSession(profileName);
    setSessions((list) => [s, ...list]);
    setMsgs([greeting(profileName)]);
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
  /** Shows a single bot "typing" bubble (idempotent) until {@link stopTyping}. */
  const startTyping = () => {
    if (typingRef.current == null) {
      typingRef.current = add({ role: 'bot', kind: 'typing' });
    }
  };
  const stopTyping = () => {
    if (typingRef.current != null) {
      remove(typingRef.current);
      typingRef.current = null;
    }
  };
  const think = (then: () => void, d = 720) => {
    const id = add({ role: 'bot', kind: 'typing' });
    setTimeout(() => {
      remove(id);
      then();
    }, d);
  };

  /* ---- scripted flow steps ---- */
  const askAmount = () => {
    const who = (flowRef.current.recipient ?? 'them').split(' ')[0];
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
        { label: 'To', value: f.recipient ?? 'recipient', mono: true },
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
  /**
   * Routes the step after an amount is chosen: swaps ask for a token, a real
   * address hands off to the agent (prepare → approval → submit), and a
   * named/demo contact continues the scripted network → review path.
   */
  const afterAmountChosen = () => {
    const f = flowRef.current;
    if (f.name === 'swap') {
      think(askSwapTo);
      return;
    }
    if (f.recipientAddress) {
      void runAgent(`Send ${f.amount} XRP to ${f.recipientAddress}. Go ahead and submit it.`);
      return;
    }
    think(askNetwork);
  };

  const routeUser = (text: string) => {
    const lc = text.toLowerCase();
    if (pendingRef.current === 'amount') {
      const n = Number.parseFloat(text.replace(/[^0-9.]/g, ''));
      pendingRef.current = null;
      flowRef.current.amount = Number.isNaN(n) ? 25 : n;
      afterAmountChosen();
      return;
    }
    if (/balance|how much do i|what.*have/.test(lc)) {
      void runAgent(text);
      return;
    }
    // Latest block / recent ledgers — answered by the agent's get_recent_blocks.
    if (/block|ledger|latest|validated/.test(lc)) {
      void runAgent(text);
      return;
    }
    // A real XRPL payment: the message contains an r-address. With an amount we
    // hand it to the agent (prepare → approval card → submit on-device). With
    // just the address, capture it as the recipient and ask for the amount.
    const inlineAddress = text.match(XRPL_ADDRESS)?.[0];
    if (inlineAddress) {
      const inlineAmount = text.match(/([\d][\d,]*(?:\.\d+)?)\s*xrp/i)?.[1];
      if (inlineAmount) {
        void runAgent(
          `Send ${inlineAmount.replace(/,/g, '')} XRP to ${inlineAddress}. Go ahead and submit it.`,
        );
        return;
      }
      flowRef.current = {
        name: 'send',
        recipient: shortAddress(inlineAddress),
        recipientAddress: inlineAddress,
      };
      return think(askAmount);
    }
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
    if (nameM) {
      // A named contact without an on-chain address yet (e.g. "Send to Maria").
      flowRef.current = { name: 'send', recipient: nameM[1] };
      if (num) {
        flowRef.current.amount = Number.parseFloat(num[1].replace(/,/g, ''));
        return think(askNetwork);
      }
      return think(askAmount);
    }
    // A send with no recipient yet — ask for the address rather than assume one.
    flowRef.current = { name: 'send' };
    return think(() =>
      add({
        role: 'bot',
        kind: 'text',
        text: 'Sure — who would you like to send to? Paste an r-address (or scan a QR), or pick a saved recipient.',
      }),
    );
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
      afterAmountChosen();
      return;
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

    // Agent-driven payment: resolve the awaiting tool loop. On approval the
    // agent signs + submits on-device and reports back as the final reply.
    const pending = approvalRef.current;
    if (pending && pending.id === msg.id) {
      approvalRef.current = null;
      if (approve) startTyping();
      pending.resolve(approve);
      return;
    }

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
          (f.recipient ?? 'them').split(' ')[0]
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
        recipient: flowRef.current.recipient,
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
