import { Icon } from '@flama/design-system-mobile/icon';
import { IconButton } from '@flama/design-system-mobile/icon-button';
import { Text } from '@flama/design-system-mobile/text';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Flow header — a glass back control, a centered title (+ optional subtitle),
// and a trailing slot kept the same width as the back control so the title stays
// optically centered. Owns its own top safe-area inset.
export function SendHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string | null;
  onBack: () => void;
  right?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-row items-center px-4 pb-2" style={{ paddingTop: insets.top + 8 }}>
      <IconButton variant="glass" accessibilityLabel="Back" onPress={onBack}>
        <Icon as={ChevronLeft} size={22} />
      </IconButton>
      <View className="flex-1 items-center px-2">
        <Text className="text-foreground text-[17px] font-bold" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-muted-foreground mt-0.5 text-[13px]" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="w-11 items-end">{right ?? null}</View>
    </View>
  );
}
