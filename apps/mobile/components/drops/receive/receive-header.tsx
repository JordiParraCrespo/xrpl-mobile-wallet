import { Icon } from '@flama/design-system-mobile/icon';
import { IconButton } from '@flama/design-system-mobile/icon-button';
import { Text } from '@flama/design-system-mobile/text';
import { ChevronLeft } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Flow header — a glass back control, a centered title, and a spacer to keep
// the title optically centered. Owns its own top safe-area inset.
export function ReceiveHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-row items-center px-4 pb-2" style={{ paddingTop: insets.top + 8 }}>
      <IconButton variant="glass" accessibilityLabel="Back" onPress={onBack}>
        <Icon as={ChevronLeft} size={22} />
      </IconButton>
      <Text className="text-foreground flex-1 text-center text-[17px] font-bold">{title}</Text>
      <View className="w-11" />
    </View>
  );
}
