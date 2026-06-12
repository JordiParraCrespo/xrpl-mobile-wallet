import { Icon } from '@flama/design-system-mobile/icon';
import { ArrowDown } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { FLOW_BG } from '../../../lib/theme-vars';

/**
 * The circular control that sits over the gap between the From and To cards and
 * reverses the swap direction. Brand-filled with a ring in the flow background
 * colour so it reads as a notch punched between the two cards. Swap-specific.
 */
export function SwapFlipButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Flip swap direction"
      onPress={onPress}
      style={{ borderColor: FLOW_BG }}
      className="h-11 w-11 items-center justify-center rounded-full border-[3px] bg-brand active:scale-[0.97]"
    >
      <Icon as={ArrowDown} size={19} className="text-white" />
    </Pressable>
  );
}
