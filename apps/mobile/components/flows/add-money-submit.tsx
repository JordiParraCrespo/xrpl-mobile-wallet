import { Button } from '@flama/design-system-mobile/button';
import { Text } from '@flama/design-system-mobile/text';
import { View } from 'react-native';

/**
 * AddMoneySubmit — the on-ramp's reassurance + commit footer: an "Arriving ·
 * Usually instantly" line over the indigo money-action. The button is
 * disabled until the amount is greater than zero.
 *
 * Feature-specific to Add money (the "instant / no-fee top-up" framing).
 */
type AddMoneySubmitProps = {
  /** Reassurance for how fast the money lands. */
  arriving?: string;
  /** Disabled until the entered amount is greater than zero. */
  disabled?: boolean;
  onPress?: () => void;
};

export function AddMoneySubmit({
  arriving = 'Usually instantly',
  disabled,
  onPress,
}: AddMoneySubmitProps) {
  return (
    <View className="px-5 pb-2.5">
      <Text className="text-muted-foreground mb-3 text-center text-[13.5px]">
        Arriving · <Text className="text-foreground font-semibold">{arriving}</Text>
      </Text>
      <Button variant="brand" size="lg" disabled={disabled} onPress={onPress} className="h-[54px]">
        <Text>Add money securely</Text>
      </Button>
    </View>
  );
}
