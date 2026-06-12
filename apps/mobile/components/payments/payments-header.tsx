import { Icon } from '@flama/design-system-mobile/icon';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { Text } from '@flama/design-system-mobile/text';
import { Plus, Search } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type PaymentsHeaderProps = {
  /** Display name behind the profile avatar (initials fallback). */
  name: string;
  onOpenProfile: () => void;
  onNewRecipient: () => void;
  /** Tapping the search pill; omit to render it as a disabled placeholder. */
  onSearch?: () => void;
};

/**
 * Payments top bar: profile avatar (→ profile), a glass "Search" pill, and a
 * "+" that starts a new recipient. The search pill is a navigation affordance,
 * not a live input — search itself is a later screen.
 */
export function PaymentsHeader({
  name,
  onOpenProfile,
  onNewRecipient,
  onSearch,
}: PaymentsHeaderProps) {
  return (
    <View className="flex-row items-center gap-3 px-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={onOpenProfile}
        className="rounded-full active:scale-[0.97]"
      >
        <InitialsAvatar name={name} size="md" />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search payments"
        disabled={!onSearch}
        onPress={onSearch}
        className="bg-card/60 border-border h-11 flex-1 flex-row items-center gap-2.5 rounded-full border px-4 active:opacity-80"
      >
        <Icon as={Search} size={18} className="text-muted-foreground" />
        <Text className="text-muted-foreground text-[15px]">Search</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New payment"
        onPress={onNewRecipient}
        className="bg-card/60 border-border h-11 w-11 items-center justify-center rounded-full border active:scale-[0.97]"
      >
        <Icon as={Plus} size={20} className="text-brand" />
      </Pressable>
    </View>
  );
}
