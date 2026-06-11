import { Icon } from '@flama/design-system-mobile/icon';
import { SessionRow } from '@flama/design-system-mobile/session-row';
import { Text } from '@flama/design-system-mobile/text';
import { SquarePen, X } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Session, SessionGroup } from './types';

const SESSION_GROUPS: SessionGroup[] = ['Today', 'Earlier'];

// Sessions drawer — slides in from the left over a dimmed scrim, grouping the
// conversation history into Today / Earlier with a New chat button on top.
// Selecting a session swaps the thread in place (no route change).
export function SessionsDrawer({
  open,
  sessions,
  activeId,
  onClose,
  onSelect,
  onNew,
}: {
  open: boolean;
  sessions: Session[];
  activeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(320, width * 0.82);

  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 280 });
  }, [open, progress]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value - 1) * (panelWidth + 24) }],
  }));

  return (
    <View pointerEvents={open ? 'auto' : 'none'} className="absolute inset-0 z-50">
      <Animated.View style={scrimStyle} className="absolute inset-0 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[panelStyle, { width: panelWidth }]}
        className="border-border bg-background absolute bottom-0 left-0 top-0 border-r-hairline"
      >
        {/* header */}
        <View
          className="border-border flex-row items-center justify-between border-b-hairline px-[18px] pb-3.5"
          style={{ paddingTop: insets.top + 12 }}
        >
          <Text className="font-display text-2xl text-foreground">Chats</Text>
          <Pressable
            accessibilityLabel="Close"
            onPress={onClose}
            className="bg-secondary h-9 w-9 items-center justify-center rounded-full active:opacity-70"
          >
            <Icon as={X} size={18} className="text-foreground" />
          </Pressable>
        </View>

        {/* new chat */}
        <View className="px-4 pb-1.5 pt-3.5">
          <Pressable
            onPress={onNew}
            className="bg-brand active:bg-brand/90 h-12 flex-row items-center justify-center gap-2 rounded-[14px]"
          >
            <Icon as={SquarePen} size={18} className="text-white" />
            <Text className="text-[15px] font-semibold text-white">New chat</Text>
          </Pressable>
        </View>

        {/* list */}
        <ScrollView className="flex-1" contentContainerClassName="px-2.5 pb-6 pt-2">
          {SESSION_GROUPS.map((group) => {
            const items = sessions.filter((s) => s.group === group);
            if (items.length === 0) return null;
            return (
              <View key={group} className="mt-2 gap-0.5">
                <Text className="text-muted-foreground px-2 py-1.5 text-[11.5px] font-bold uppercase tracking-wide">
                  {group}
                </Text>
                {items.map((s) => (
                  <SessionRow
                    key={s.id}
                    title={s.title}
                    preview={s.preview}
                    time={s.time}
                    active={s.id === activeId}
                    onPress={() => onSelect(s.id)}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
