import { Button } from '@flama/design-system-mobile/button';
import { DetailList, DetailRow } from '@flama/design-system-mobile/detail-list';
import { FlowHeader } from '@flama/design-system-mobile/flow-header';
import { applyKeypadKey, Keypad } from '@flama/design-system-mobile/keypad';
import { Text } from '@flama/design-system-mobile/text';
import { cn } from '@flama/design-system-mobile/utils';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SwapFlipButton } from '../../components/flows/swap/swap-flip-button';
import { SwapTokenCard } from '../../components/flows/swap/swap-token-card';
import { darkVars, FLOW_BG } from '../../lib/theme';

// Mock token set for the swap UI — balances, USD price and tint per asset.
// Static stand-in; a real build would source these from the wallet + a quote.
const SWAP_TOKENS = {
  XRP: { symbol: 'XRP', color: '#14161a', usd: 0.6184, balance: 1204.51 },
  RLUSD: { symbol: 'RLUSD', color: '#0ca678', usd: 1.0008, balance: 120.0 },
  BTC: { symbol: 'BTC', color: '#f7931a', usd: 61240.5, balance: 0.004 },
  ETH: { symbol: 'ETH', color: '#627eea', usd: 2410.33, balance: 0.12 },
} as const;

type TokenSymbol = keyof typeof SWAP_TOKENS;

/** Cycle order for the mock token picker (tapping a pill steps to the next). */
const ORDER: TokenSymbol[] = ['XRP', 'RLUSD', 'BTC', 'ETH'];

function money(value: number, decimals = 2): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Swap — convert between tokens. From / To cards with a flip control, the live
 * rate and network fee, and a balance-guarded Review CTA over the shared
 * keypad. Mock UI only: amounts compute off the static rate table above.
 * Design: swap.html · flows/swap-app.jsx (+ flow-kit.jsx).
 */
export default function SwapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fromSym, setFromSym] = React.useState<TokenSymbol>('XRP');
  const [toSym, setToSym] = React.useState<TokenSymbol>('RLUSD');
  const [amount, setAmount] = React.useState('100');

  const from = SWAP_TOKENS[fromSym];
  const to = SWAP_TOKENS[toSym];

  const value = Number.parseFloat(amount || '0') || 0;
  const usdValue = value * from.usd;
  const outValue = usdValue / to.usd;
  const over = value > from.balance;
  const canReview = value > 0 && !over;

  // Step a side to the next token, skipping whatever the other side holds.
  const cycle = (current: TokenSymbol, other: TokenSymbol) => {
    let i = (ORDER.indexOf(current) + 1) % ORDER.length;
    while (ORDER[i] === other) i = (i + 1) % ORDER.length;
    return ORDER[i];
  };
  const flip = () => {
    setFromSym(toSym);
    setToSym(fromSym);
  };

  const rate = from.usd / to.usd;

  return (
    <View
      style={[vars(darkVars), { backgroundColor: FLOW_BG, paddingTop: insets.top }]}
      className="dark flex-1"
    >
      <StatusBar style="light" />
      <FlowHeader title="Swap" onBack={() => router.back()} />

      {/* From / To cards with the flip control notched over the gap. */}
      <View className="px-[18px] pt-2.5">
        <View className="relative">
          <View className="gap-2">
            <SwapTokenCard
              symbol={from.symbol}
              color={from.color}
              amount={amount}
              sub={`Balance ${from.balance.toLocaleString('en-US', {
                maximumFractionDigits: 4,
              })} · ${money(usdValue)}`}
              onPickToken={() => setFromSym(cycle(fromSym, toSym))}
            />
            <SwapTokenCard
              muted
              symbol={to.symbol}
              color={to.color}
              amount={outValue.toLocaleString('en-US', {
                maximumFractionDigits: to.symbol === 'BTC' ? 6 : 2,
              })}
              sub={`1 ${from.symbol} ≈ ${rate.toLocaleString('en-US', {
                maximumFractionDigits: 4,
              })} ${to.symbol}`}
              onPickToken={() => setToSym(cycle(toSym, fromSym))}
            />
          </View>
          <View pointerEvents="box-none" className="absolute inset-0 items-center justify-center">
            <SwapFlipButton onPress={flip} />
          </View>
        </View>
      </View>

      {/* Rate / network fee — always visible before commitment. */}
      <View className="flex-1 justify-end px-6 pb-2">
        <DetailList>
          <DetailRow label="Rate" value={`1 ${from.symbol} ≈ ${money(from.usd, 4)}`} />
          <DetailRow label="Network fee" value="0.00001 XRP" />
        </DetailList>
      </View>

      {/* CTA — balance guard flips it to a disabled "Insufficient balance". */}
      <View className="px-5 pb-2.5">
        <Button
          variant="brand"
          disabled={!canReview}
          onPress={() => {}}
          className={cn(
            'h-[54px] w-full rounded-full',
            !canReview && 'bg-white/[0.06] opacity-100',
          )}
        >
          <Text className={cn('text-[16px] font-bold', canReview ? 'text-white' : 'text-white/40')}>
            {over ? 'Insufficient balance' : 'Review swap'}
          </Text>
        </Button>
      </View>

      <View className="px-2" style={{ paddingBottom: insets.bottom + 4 }}>
        <Keypad onKey={(key) => setAmount((prev) => applyKeypadKey(prev, key))} />
      </View>
    </View>
  );
}
