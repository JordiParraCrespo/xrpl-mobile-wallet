import { Icon } from '@flama/design-system-mobile/icon';
import { IconButton } from '@flama/design-system-mobile/icon-button';
import { NotificationRow } from '@flama/design-system-mobile/notification-row';
import { Text } from '@flama/design-system-mobile/text';
import { cn } from '@flama/design-system-mobile/utils';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  type LucideIcon,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tone = 'positive' | 'warning' | 'info' | 'brand' | 'neutral';
type Group = 'today' | 'earlier';

type Notification = {
  id: number;
  group: Group;
  icon: LucideIcon;
  tone: Tone;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

/** Mock feed mirroring the design (`HNotifications` in `home/home-parts2.jsx`). */
const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    group: 'today',
    icon: ArrowDownLeft,
    tone: 'positive',
    title: 'Received 60 XRP',
    body: 'From Maria Gutiérrez · ≈ $37.10',
    time: '2h',
    unread: true,
  },
  {
    id: 2,
    group: 'today',
    icon: ArrowLeftRight,
    tone: 'brand',
    title: 'Swap completed',
    body: '100 XRP → 61.79 RLUSD',
    time: '3h',
    unread: true,
  },
  {
    id: 3,
    group: 'today',
    icon: ShieldCheck,
    tone: 'warning',
    title: 'New sign-in',
    body: 'iPhone 15 · Barcelona, ES',
    time: '6h',
    unread: false,
  },
  {
    id: 4,
    group: 'earlier',
    icon: ArrowUpRight,
    tone: 'neutral',
    title: 'Payment settled',
    body: 'You sent 56.4 XRP to Aerolink Travel',
    time: 'Mon',
    unread: false,
  },
  {
    id: 5,
    group: 'earlier',
    icon: TrendingUp,
    tone: 'info',
    title: 'XRP is up 2.4% today',
    body: 'Now ≈ $0.6184',
    time: 'Mon',
    unread: false,
  },
  {
    id: 6,
    group: 'earlier',
    icon: Sparkles,
    tone: 'brand',
    title: 'DropPoints is coming',
    body: 'Earn rewards on every move — join the waitlist',
    time: 'Sun',
    unread: false,
  },
];

/** Groups rendered top-to-bottom; empty groups are skipped. */
const GROUP_ORDER: Group[] = ['today', 'earlier'];

/**
 * Notifications centre — the home bell panel (design: `HNotifications` in
 * `home/home-parts2.jsx`), as a slide-up modal. Tone-coded activity grouped
 * into Today / Earlier, with a one-tap "Mark all as read" and a close button.
 * The feed is mocked for now; the design-system {@link NotificationRow} carries
 * the row, so a real feed drops in behind the same shape.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const dark = useColorScheme().colorScheme === 'dark';

  const [items, setItems] = React.useState(NOTIFICATIONS);
  const hasUnread = items.some((n) => n.unread);
  const markAllRead = () =>
    setItems((prev) => prev.map((n) => (n.unread ? { ...n, unread: false } : n)));

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={dark ? 'light' : 'dark'} />

      <View style={{ paddingTop: insets.top + 8 }} className="px-5">
        <View className="min-h-[44px] flex-row items-center justify-between py-1">
          <Text className="font-display text-[26px] tracking-[-0.4px] text-foreground">
            {t('notifications.title')}
          </Text>
          <IconButton
            variant="soft"
            size="sm"
            accessibilityLabel={t('notifications.close')}
            onPress={() => router.back()}
          >
            <Icon as={X} size={18} />
          </IconButton>
        </View>

        <Pressable disabled={!hasUnread} onPress={markAllRead} className="self-start py-1.5">
          <Text
            className={cn(
              'text-[13.5px] font-semibold',
              hasUnread ? 'text-brand' : 'text-muted-foreground',
            )}
          >
            {t('notifications.markAllRead')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pt-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {GROUP_ORDER.map((group) => {
          const groupItems = items.filter((n) => n.group === group);
          if (groupItems.length === 0) return null;
          return (
            <View key={group} className="mt-3">
              <Text className="text-muted-foreground px-1 pb-2 text-xs font-bold uppercase tracking-wide">
                {t(`notifications.groups.${group}`)}
              </Text>
              <View className="border-border bg-card overflow-hidden rounded-xl border">
                {groupItems.map((n, i) => (
                  <View key={n.id}>
                    {i > 0 ? <View className="bg-border ml-[67px] h-px" /> : null}
                    <NotificationRow
                      icon={n.icon}
                      tone={n.tone}
                      title={n.title}
                      body={n.body}
                      time={n.time}
                      unread={n.unread}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
