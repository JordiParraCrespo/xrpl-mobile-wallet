import { AssistantAvatar } from '@flama/design-system-mobile/assistant-avatar';
import { ChatMessage, type ChatMessageData } from '@flama/design-system-mobile/chat-message';
import { Icon } from '@flama/design-system-mobile/icon';
import { SessionRow } from '@flama/design-system-mobile/session-row';
import { Text } from '@flama/design-system-mobile/text';
import { useRouter } from 'expo-router';
import { ChevronLeft, Menu, Send, SquarePen, X } from 'lucide-react-native';
import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Routes } from '../../../lib/routes';

// Dewy — the wallet assistant (chat.html). A full-screen, tool-using chat:
// text + user bubbles, AskUserQuestions chips, approve/decline action cards,
// balance / result / error cards, and a composer with quick chips. The
// sessions drawer slides in from the left and swaps the thread in place.
// Every money action is an explicit approve/decline card — never silent.

const dewyAvatar = require('../../../assets/dewy.png');

const RATE = 0.6184;
const XRPL_BAL = 1204.51;

/** A thread message: the design-system payload plus our routing metadata. */
type ChatPayload = ChatMessageData & { qid?: string };
type Msg = ChatPayload & { id: number };

type SessionGroup = 'Today' | 'Earlier';
type Session = {
  id: string;
  title: string;
  preview: string;
  time: string;
  group: SessionGroup;
  msgs: Msg[];
};

const GREETING: Msg = {
  id: 0,
  role: 'bot',
  kind: 'text',
  text: 'Hi Jordan — I’m your wallet assistant. I can send or request XRP, swap tokens, check balances and add recipients. What would you like to do?',
};

/** Canned past conversations, each with its own full thread. */
const SESSION_SEEDS: Session[] = [
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

const CHIPS = ['Send to Maria', 'Send 5,000 XRP', 'Check my balance', 'Swap XRP → RLUSD'];

function newSession(): Session {
  return {
    id: `new-${Date.now()}`,
    title: 'New chat',
    preview: 'Start a conversation',
    time: 'Now',
    group: 'Today',
    msgs: [GREETING],
  };
}

/** Safe text accessor for the live session title/preview sync. */
function textOf(m: Msg): string | undefined {
  return 'text' in m ? m.text : undefined;
}

function DewyAvatar({ size = 26 }: { size?: number }) {
  return <AssistantAvatar source={dewyAvatar} size={size} />;
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const idRef = React.useRef(1);
  const flowRef = React.useRef<{
    name?: 'send' | 'swap';
    recipient?: string;
    amount?: number;
    network?: string;
    to?: string;
  }>({});
  const pendingRef = React.useRef<string | null>(null);
  const scrollRef = React.useRef<ScrollView>(null);

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
  const [draft, setDraft] = React.useState('');
  const [composing, setComposing] = React.useState(false);

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

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    add({ role: 'user', text: trimmed });
    routeUser(trimmed);
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    submit(text);
  };

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace(Routes.Home);
  };

  const canSend = draft.trim().length > 0;

  return (
    <View className="bg-background flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* header */}
        <View
          className="border-border flex-row items-center gap-2 border-b-hairline px-3 pb-3"
          style={{ paddingTop: insets.top + 8 }}
        >
          <HeaderButton label="Close" onPress={close}>
            <Icon as={ChevronLeft} size={20} className="text-foreground" />
          </HeaderButton>
          <HeaderButton label="Sessions" onPress={() => setDrawerOpen(true)}>
            <Icon as={Menu} size={20} className="text-foreground" />
          </HeaderButton>
          <AssistantAvatar source={dewyAvatar} size={38} ring />
          <View className="min-w-0 flex-1">
            <Text className="text-foreground text-base font-bold">Dewy</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="bg-positive h-1.5 w-1.5 rounded-full" />
              <Text className="text-muted-foreground text-[12.5px]">Online · XRPL assistant</Text>
            </View>
          </View>
          <HeaderButton label="New chat" onPress={startNew}>
            <Icon as={SquarePen} size={18} className="text-foreground" />
          </HeaderButton>
        </View>

        {/* messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="px-4 pb-2 pt-[18px] gap-3"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {msgs.map((m) => (
            <ChatMessage
              key={m.id}
              message={m}
              avatar={<DewyAvatar />}
              onAnswer={(opt) => onAnswer(m, opt)}
              onAction={(approved) => onAction(m, approved)}
              onErrorAction={(retry) => onError(m, retry)}
            />
          ))}
        </ScrollView>

        {/* composer */}
        <View
          className="border-border border-t-hairline px-3.5 pt-2"
          style={{ paddingBottom: insets.bottom + 10 }}
        >
          {!composing ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pb-2.5"
            >
              {CHIPS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => submit(c)}
                  className="border-input bg-card rounded-full border px-3.5 py-2 active:opacity-70"
                >
                  <Text className="text-foreground text-[13px] font-medium">{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          <View className="border-border bg-card flex-row items-end gap-2.5 rounded-[24px] border py-1.5 pl-4 pr-1.5">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onFocus={() => setComposing(true)}
              onBlur={() => {
                if (!draft) setComposing(false);
              }}
              placeholder="Ask Dewy to do something…"
              placeholderTextColor="#8d969e"
              multiline
              className="text-foreground max-h-[120px] flex-1 py-2 text-[15px] leading-[22px]"
              onSubmitEditing={send}
            />
            <Pressable
              onPress={send}
              disabled={!canSend}
              accessibilityLabel="Send"
              className={`h-10 w-10 items-center justify-center rounded-full ${
                canSend ? 'bg-brand active:bg-brand/90' : 'bg-secondary'
              }`}
            >
              <Icon
                as={Send}
                size={18}
                className={canSend ? 'text-white' : 'text-muted-foreground'}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <SessionsDrawer
        open={drawerOpen}
        sessions={sessions}
        activeId={activeId}
        onClose={() => setDrawerOpen(false)}
        onSelect={loadSession}
        onNew={startNew}
      />
    </View>
  );
}

function HeaderButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="border-input bg-card h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full active:opacity-70"
    >
      {children}
    </Pressable>
  );
}

const SESSION_GROUPS: SessionGroup[] = ['Today', 'Earlier'];

function SessionsDrawer({
  open,
  sessions,
  activeId,
  onClose,
  onSelect,
  onNew,
}: {
  open: boolean;
  sessions: Session[];
  activeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(320, width * 0.82);

  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 280 });
  }, [open, progress]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value - 1) * (panelWidth + 24) }],
  }));

  return (
    <View pointerEvents={open ? 'auto' : 'none'} className="absolute inset-0 z-50">
      <Animated.View style={scrimStyle} className="absolute inset-0 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[panelStyle, { width: panelWidth }]}
        className="border-border bg-background absolute bottom-0 left-0 top-0 border-r-hairline"
      >
        {/* header */}
        <View
          className="border-border flex-row items-center justify-between border-b-hairline px-[18px] pb-3.5"
          style={{ paddingTop: insets.top + 12 }}
        >
          <Text className="font-display text-2xl text-foreground">Chats</Text>
          <Pressable
            accessibilityLabel="Close"
            onPress={onClose}
            className="bg-secondary h-9 w-9 items-center justify-center rounded-full active:opacity-70"
          >
            <Icon as={X} size={18} className="text-foreground" />
          </Pressable>
        </View>

        {/* new chat */}
        <View className="px-4 pb-1.5 pt-3.5">
          <Pressable
            onPress={onNew}
            className="bg-brand active:bg-brand/90 h-12 flex-row items-center justify-center gap-2 rounded-[14px]"
          >
            <Icon as={SquarePen} size={18} className="text-white" />
            <Text className="text-[15px] font-semibold text-white">New chat</Text>
          </Pressable>
        </View>

        {/* list */}
        <ScrollView className="flex-1" contentContainerClassName="px-2.5 pb-6 pt-2">
          {SESSION_GROUPS.map((group) => {
            const items = sessions.filter((s) => s.group === group);
            if (items.length === 0) return null;
            return (
              <View key={group} className="mt-2 gap-0.5">
                <Text className="text-muted-foreground px-2 py-1.5 text-[11.5px] font-bold uppercase tracking-wide">
                  {group}
                </Text>
                {items.map((s) => (
                  <SessionRow
                    key={s.id}
                    title={s.title}
                    preview={s.preview}
                    time={s.time}
                    active={s.id === activeId}
                    onPress={() => onSelect(s.id)}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
