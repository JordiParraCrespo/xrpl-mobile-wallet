import { SelectorPill } from '@flama/design-system-mobile/selector-pill';
import { Text } from '@flama/design-system-mobile/text';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Check, ChevronLeft, Copy, Info, Share2 } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Rect } from 'react-native-svg';

// Receive — share an address to get paid (receive.html · flows/receive-app.jsx).
// Dark money-flow surface built on the shared flow-kit language: an account
// switcher (XRP Ledger / XRPL EVM), a branded QR, a tap-to-copy address, the
// destination tag XRPL footgun surfaced explicitly, and an always-visible
// network-safety warning. Copy + Share anchor the base.
//
// Data is mocked here; in app-land the account list comes from the wallet
// module (`useWalletState` / `useChainBalance`) keyed by the selected chain.

// Dark flow theme — explicit values mirroring flow-kit's `--f-*` vars, since
// the screen is an immersive dark surface rather than a tokenized light card.
const FLOW = {
  bg: '#08080b',
  fg: '#ffffff',
  dim: 'rgba(255,255,255,0.6)',
  faint: 'rgba(255,255,255,0.4)',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.12)',
  ctrl: 'rgba(255,255,255,0.10)',
  brand: '#5b41dd',
  brand300: '#b3a7f7',
  positive: '#34d399',
  warning: '#f5a524',
} as const;

type ReceiveAccount = {
  symbol: string;
  name: string;
  color: string;
  address: string;
  /** Surfaced only for XRPL accounts that require one. */
  tag: string | null;
  network: string;
  /** QR seed — keeps the faux module grid stable per account. */
  seed: number;
};

const ACCOUNTS: ReceiveAccount[] = [
  {
    symbol: 'XRP',
    name: 'XRP Ledger',
    color: '#14161a',
    address: 'rJordn4PqW9bExAmp1eXRPLedgerKq7vZ2',
    tag: '584213',
    network: 'XRPL Mainnet',
    seed: 3,
  },
  {
    symbol: 'XRP',
    name: 'XRPL EVM',
    color: '#5b41dd',
    address: '0x8fC2e3A1bD49a07cF3e1b2A6d9E0f4C7a1B3d2E6',
    tag: null,
    network: 'XRPL EVM Sidechain',
    seed: 4,
  },
];

export default function ReceiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const account = ACCOUNTS[index];

  React.useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const cycleAccount = () => {
    setIndex((i) => (i + 1) % ACCOUNTS.length);
    setCopied(false);
  };

  // Clipboard wiring lives in app-land (expo-clipboard); the mocked screen
  // confirms the action visually like the design's `copied` state.
  const copy = () => {
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1600);
  };

  const share = () => {
    Share.share({
      message: account.address,
    }).catch(() => {
      // Sharing is best-effort; a dismissed sheet is not an error.
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: FLOW.bg }}>
      <StatusBar style="light" />

      {/* Header — back · centered title · spacer */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          className="active:scale-[0.96]"
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: FLOW.ctrl,
          }}
        >
          <ChevronLeft size={22} color={FLOW.fg} />
        </Pressable>
        <Text className="flex-1 text-center text-[17px] font-bold" style={{ color: FLOW.fg }}>
          Receive
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 24,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account switcher — cycles XRP Ledger ⇄ XRPL EVM */}
        <View style={{ marginTop: 4, marginBottom: 22 }}>
          <SelectorPill
            glass
            label={account.name}
            asset={{ symbol: account.symbol, color: account.color }}
            onPress={cycleAccount}
          />
        </View>

        <FakeQR size={196} seed={account.seed} brand={FLOW.brand} />

        {/* Address — tap to copy */}
        <View style={{ marginTop: 18, alignItems: 'center' }}>
          <Text className="mb-1.5 text-[13px]" style={{ color: FLOW.faint }}>
            Your {account.name} address
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy address"
            onPress={copy}
            className="active:scale-[0.97]"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              maxWidth: 300,
              backgroundColor: FLOW.card,
              borderWidth: 1,
              borderColor: FLOW.border,
              borderRadius: 14,
              paddingVertical: 11,
              paddingHorizontal: 14,
            }}
          >
            <Text
              className="flex-1 font-mono text-[13.5px] leading-[18px]"
              style={{ color: FLOW.fg }}
            >
              {account.address}
            </Text>
            {copied ? (
              <Check size={17} color={FLOW.positive} />
            ) : (
              <Copy size={17} color={FLOW.brand300} />
            )}
          </Pressable>
        </View>

        {/* Destination tag — XRPL accounts that require one */}
        {account.tag ? (
          <View
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: FLOW.card,
              borderWidth: 1,
              borderColor: FLOW.border,
              borderRadius: 999,
              paddingVertical: 7,
              paddingHorizontal: 14,
            }}
          >
            <Text className="text-[12.5px]" style={{ color: FLOW.dim }}>
              Destination tag
            </Text>
            <Text className="font-mono text-[13.5px] font-semibold" style={{ color: FLOW.fg }}>
              {account.tag}
            </Text>
          </View>
        ) : null}

        {/* Network safety warning — always visible */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 9,
            marginTop: 18,
            maxWidth: 320,
            paddingHorizontal: 4,
          }}
        >
          <Info size={15} color={FLOW.warning} style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12.5px] leading-[18px]" style={{ color: FLOW.dim }}>
            Only send assets on the{' '}
            <Text className="text-[12.5px]" style={{ color: FLOW.fg }}>
              {account.network}
            </Text>
            . Sending from another network may lose your funds.
          </Text>
        </View>
      </ScrollView>

      {/* Actions — Copy · Share */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: insets.bottom + 16,
          flexDirection: 'row',
          gap: 10,
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={copy}
          className="active:scale-[0.97]"
          style={{
            flex: 1,
            height: 52,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: FLOW.border,
            backgroundColor: FLOW.card,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {copied ? <Check size={18} color={FLOW.fg} /> : <Copy size={18} color={FLOW.fg} />}
          <Text className="text-[15px] font-semibold" style={{ color: FLOW.fg }}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={share}
          className="active:scale-[0.97]"
          style={{
            flex: 1,
            height: 52,
            borderRadius: 999,
            backgroundColor: FLOW.brand,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Share2 size={18} color="#fff" />
          <Text className="text-[15px] font-semibold text-white">Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

// FakeQR — a deterministic faux QR with a branded center mark, ported from the
// design's flow-kit. A real scannable code comes from a QR encoder in app-land;
// this stands in for the mocked address.
function FakeQR({ size = 196, seed = 7, brand }: { size?: number; seed?: number; brand: string }) {
  const padding = 16;
  const inner = size;
  const modules = 25;
  const cell = inner / modules;
  const dark = '#0b0a14';

  // Same LCG as the design so each account's pattern is stable.
  const rects: React.ReactNode[] = [];
  let s = seed * 99991;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > modules - 9 && y < 8) || (x < 8 && y > modules - 9);

  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (inFinder(x, y)) continue;
      if (rnd() > 0.52) {
        rects.push(
          <Rect
            key={`m-${x}-${y}`}
            x={x * cell + cell * 0.12}
            y={y * cell + cell * 0.12}
            width={cell * 0.76}
            height={cell * 0.76}
            rx={cell * 0.22}
            fill={dark}
          />,
        );
      }
    }
  }

  const finder = (gx: number, gy: number) => [
    <Rect
      key={`f1-${gx}-${gy}`}
      x={gx * cell}
      y={gy * cell}
      width={cell * 7}
      height={cell * 7}
      rx={cell * 1.6}
      fill={dark}
    />,
    <Rect
      key={`f2-${gx}-${gy}`}
      x={(gx + 1) * cell}
      y={(gy + 1) * cell}
      width={cell * 5}
      height={cell * 5}
      rx={cell}
      fill="#ffffff"
    />,
    <Rect
      key={`f3-${gx}-${gy}`}
      x={(gx + 2) * cell}
      y={(gy + 2) * cell}
      width={cell * 3}
      height={cell * 3}
      rx={cell * 0.7}
      fill={dark}
    />,
  ];

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: padding,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 40,
        shadowOffset: { width: 0, height: 10 },
      }}
    >
      <Svg width={inner} height={inner} viewBox={`0 0 ${inner} ${inner}`}>
        {rects}
        {finder(0, 0)}
        {finder(modules - 7, 0)}
        {finder(0, modules - 7)}
        {/* Branded center mark — Dewy drop on a brand disc. */}
        <Circle cx={inner / 2} cy={inner / 2} r={inner * 0.11} fill="#fff" />
        <Circle cx={inner / 2} cy={inner / 2} r={inner * 0.092} fill={brand} />
      </Svg>
    </View>
  );
}
