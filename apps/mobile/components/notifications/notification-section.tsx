import { NotificationRow } from '@flama/design-system-mobile/notification-row';
import { Text } from '@flama/design-system-mobile/text';
import type { WalletNotification } from '@flama/frontend';
import { View } from 'react-native';
import { NOTIFICATION_ICONS } from './notification-icons';

/** Left inset of the divider so it starts past the icon disc (padding + disc + gap). */
const DIVIDER_INSET = 14 + 40 + 12;

/**
 * A labelled group of notifications in the bell panel (e.g. TODAY / EARLIER).
 *
 * Feature-specific composition: an uppercase section label over a hairline card
 * that stacks design-system {@link NotificationRow}s, divided by an inset rule
 * that aligns under the text rather than the icon (matching home.html).
 */
export function NotificationSection({
  label,
  items,
}: {
  label: string;
  items: WalletNotification[];
}) {
  return (
    <View className="mt-2.5">
      <Text className="px-1 pb-2 pt-0.5 text-[12.5px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((n, i) => (
          <View key={n.id}>
            {i ? <View style={{ marginLeft: DIVIDER_INSET }} className="h-px bg-border" /> : null}
            <NotificationRow
              icon={NOTIFICATION_ICONS[n.icon]}
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
}
