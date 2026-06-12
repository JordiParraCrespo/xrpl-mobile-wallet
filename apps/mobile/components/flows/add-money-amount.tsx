import { AmountDisplay } from '@flama/design-system-mobile/amount-display';
import { SelectorPill } from '@flama/design-system-mobile/selector-pill';
import { Text } from '@flama/design-system-mobile/text';
import { Wallet } from 'lucide-react-native';
import { View } from 'react-native';

/**
 * AddMoneyAmount — the centered heart of the Add money on-ramp: the large
 * local-currency figure with a blinking-caret affordance, a quiet "No fee"
 * reassurance line, and the funding-source pill (where the money comes from).
 *
 * Feature-specific to Add money — it pairs the shared `AmountDisplay` and
 * `SelectorPill` primitives with the on-ramp's copy and funding-source data.
 */
type AddMoneyAmountProps = {
  /** The amount string driven by the keypad (no leading currency symbol). */
  amount: string;
  /** The label of the funding source, e.g. "Bankinter · USD". */
  sourceLabel: string;
  /** Quiet line under the amount — the on-ramp charges no fee. */
  feeNote: string;
  onPressSource?: () => void;
};

export function AddMoneyAmount({
  amount,
  sourceLabel,
  feeNote,
  onPressSource,
}: AddMoneyAmountProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <AmountDisplay value={amount} symbol="$" showCursor />
      <Text className="text-muted-foreground mt-3.5 text-[15px]">{feeNote}</Text>
      <SelectorPill className="mt-6" icon={Wallet} label={sourceLabel} onPress={onPressSource} />
    </View>
  );
}
