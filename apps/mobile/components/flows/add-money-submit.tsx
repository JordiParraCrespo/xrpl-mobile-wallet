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
  /** The quiet "Arriving" lead-in for the reassurance line. */
  arrivingLabel: string;
  /** Reassurance for how fast the money lands (e.g. "Usually instantly"). */
  arrivingValue: string;
  /** The money-action label. */
  submitLabel: string;
  /** Disabled until the entered amount is greater than zero. */
  disabled?: boolean;
  onPress?: () => void;
};

export function AddMoneySubmit({
  arrivingLabel,
  arrivingValue,
  submitLabel,
  disabled,
  onPress,
}: AddMoneySubmitProps) {
  return (
    <View className="px-5 pb-2.5">
      <Text className="text-muted-foreground mb-3 text-center text-[13.5px]">
        {arrivingLabel} · <Text className="text-foreground font-semibold">{arrivingValue}</Text>
      </Text>
      <Button variant="brand" size="lg" disabled={disabled} onPress={onPress} className="h-[54px]">
        <Text>{submitLabel}</Text>
      </Button>
    </View>
  );
}
