import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { ChevronLeft, Menu, SquarePen } from 'lucide-react-native';
import type * as React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DewyAvatar } from './dewy-avatar';

// Chat header — close · sessions (left), Dewy identity with a live online dot,
// and a new-chat compose button (right). Owns its own top safe-area inset.
export function ChatHeader({
  onClose,
  onOpenSessions,
  onNewChat,
}: {
  onClose: () => void;
  onOpenSessions: () => void;
  onNewChat: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="border-chat-hairline flex-row items-center gap-2 border-b-hairline px-3 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      <HeaderButton label="Close" onPress={onClose}>
        <Icon as={ChevronLeft} size={20} className="text-chat-fg" />
      </HeaderButton>
      <HeaderButton label="Sessions" onPress={onOpenSessions}>
        <Icon as={Menu} size={20} className="text-chat-fg" />
      </HeaderButton>
      <DewyAvatar size={38} ring />
      <View className="min-w-0 flex-1">
        <Text className="text-chat-fg text-base font-bold">Dewy</Text>
        <View className="flex-row items-center gap-1.5">
          <View className="bg-chat-positive h-1.5 w-1.5 rounded-full" />
          <Text className="text-chat-dim text-[12.5px]">Online · XRPL assistant</Text>
        </View>
      </View>
      <HeaderButton label="New chat" onPress={onNewChat}>
        <Icon as={SquarePen} size={18} className="text-chat-fg" />
      </HeaderButton>
    </View>
  );
}

function HeaderButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="border-chat-chip-line bg-chat-chip h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border active:opacity-70"
    >
      {children}
    </Pressable>
  );
}
