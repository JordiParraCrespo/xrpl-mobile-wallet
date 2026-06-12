import { Icon } from '@flama/design-system-mobile/icon';
import { IconButton } from '@flama/design-system-mobile/icon-button';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { Text } from '@flama/design-system-mobile/text';
import { ChevronLeft } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Payment-chat header — a glass back control, the centered contact name with
// their XRPL handle in mono beneath, and the contact avatar trailing. Owns its
// own top safe-area inset.
export function PaymentChatHeader({
  name,
  handle,
  onBack,
}: {
  name: string;
  handle: string;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-row items-center gap-3 px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
      <IconButton variant="glass" accessibilityLabel="Back" onPress={onBack}>
        <Icon as={ChevronLeft} size={22} className="text-foreground" />
      </IconButton>
      <View className="min-w-0 flex-1 items-center">
        <Text numberOfLines={1} className="text-foreground text-[16px] font-bold">
          {name}
        </Text>
        <Text className="text-muted-foreground font-mono text-[12.5px]">{handle}</Text>
      </View>
      <InitialsAvatar name={name} size="md" />
    </View>
  );
}
