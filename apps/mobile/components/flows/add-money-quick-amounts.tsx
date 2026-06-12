import { Chip } from '@flama/design-system-mobile/chip';
import { View } from 'react-native';

/**
 * AddMoneyQuickAmounts — a row of preset top-up amounts ($25 / $50 / $100 /
 * $200) that sits above the keypad. Tapping one sets the amount outright; the
 * chip matching the current amount is highlighted in the brand colour so the
 * active preset reads at a glance.
 *
 * Feature-specific to Add money — the presets are the on-ramp's common
 * top-up sizes, not a shared concern.
 */
const QUICK_AMOUNTS = ['25', '50', '100', '200'] as const;

type AddMoneyQuickAmountsProps = {
  /** The current amount string, used to highlight the matching preset. */
  amount: string;
  /** Sets the amount to the tapped preset. */
  onSelect: (amount: string) => void;
};

export function AddMoneyQuickAmounts({ amount, onSelect }: AddMoneyQuickAmountsProps) {
  return (
    <View className="flex-row gap-2">
      {QUICK_AMOUNTS.map((value) => (
        <Chip
          key={value}
          variant={amount === value ? 'primary' : 'glass'}
          className="flex-1"
          onPress={() => onSelect(value)}
        >
          {`$${value}`}
        </Chip>
      ))}
    </View>
  );
}
