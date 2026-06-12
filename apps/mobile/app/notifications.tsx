import { Icon } from '@flama/design-system-mobile/icon';
import { IconButton } from '@flama/design-system-mobile/icon-button';
import { Text } from '@flama/design-system-mobile/text';
import { cn } from '@flama/design-system-mobile/utils';
import type { NotificationGroup } from '@flama/frontend';
import { useMarkAllNotificationsRead, useNotifications } from '@flama/frontend/react';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationSection } from '../components/notifications/notification-section';

/** Groups rendered top-to-bottom; empty groups are skipped. */
const GROUP_ORDER: NotificationGroup[] = ['today', 'earlier'];

/**
 * Notifications center — the home bell panel as a slide-up modal. Tone-coded
 * activity grouped into Today / Earlier, with a one-tap "Mark all as read".
 * Data comes from the notifications domain (mock feed for now). Design:
 * home.html (HNotifications).
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data: notifications = [], isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const hasUnread = notifications.some((n) => n.unread);
  const isEmpty = !isLoading && notifications.length === 0;

  return (
    <View className="flex-1 bg-background">
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

        <Pressable
          disabled={!hasUnread || markAllRead.isPending}
          onPress={() => markAllRead.mutate()}
          className="self-start py-1.5"
        >
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
        className="flex-1"
        contentContainerClassName="px-4 pb-7 pt-1"
        showsVerticalScrollIndicator={false}
      >
        {GROUP_ORDER.map((group) => {
          const items = notifications.filter((n) => n.group === group);
          if (!items.length) return null;
          return (
            <NotificationSection
              key={group}
              label={t(`notifications.groups.${group}`)}
              items={items}
            />
          );
        })}

        {isEmpty ? (
          <View className="items-center px-6 pt-24">
            <Text className="text-center text-[14.5px] text-muted-foreground">
              {t('notifications.empty')}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
