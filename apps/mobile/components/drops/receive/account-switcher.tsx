import { SelectorPill } from '@flama/design-system-mobile/selector-pill';
import { View } from 'react-native';
import type { ReceiveAccount } from './receive-data';

// Account switcher — a glass pill that cycles the receiving account
// (XRP Ledger ⇄ XRPL EVM). Tapping it advances to the next account.
export function AccountSwitcher({
  account,
  onCycle,
}: {
  account: ReceiveAccount;
  onCycle: () => void;
}) {
  return (
    <View className="mb-[22px] mt-1">
      <SelectorPill
        glass
        label={account.name}
        asset={{ symbol: account.symbol, color: account.color }}
        onPress={onCycle}
      />
    </View>
  );
}
