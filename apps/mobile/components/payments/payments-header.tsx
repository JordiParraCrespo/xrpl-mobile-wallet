import { GlassBackdrop } from '@flama/design-system-mobile/glass-panel';
import { Icon } from '@flama/design-system-mobile/icon';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { Text } from '@flama/design-system-mobile/text';
import { Plus, Search } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
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
 * not a live input — search itself is a later screen. Pill and button are the
 * design's real glass (white-tint fill, white hairline, backdrop blur) so the
 * backdrop blooms glow through them.
 */
export function PaymentsHeader({
  name,
  onOpenProfile,
  onNewRecipient,
  onSearch,
}: PaymentsHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3 px-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('payments.openProfile')}
        onPress={onOpenProfile}
        className="rounded-full active:scale-[0.97]"
      >
        <InitialsAvatar name={name} size="md" />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('payments.search')}
        disabled={!onSearch}
        onPress={onSearch}
        className="h-11 flex-1 flex-row items-center gap-2.5 overflow-hidden rounded-full border border-white/60 bg-white/[0.42] px-4 active:opacity-80"
      >
        <GlassBackdrop intensity={18} />
        <Icon as={Search} size={18} className="text-muted-foreground" />
        <Text className="text-muted-foreground text-[15px]">{t('payments.search')}</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('payments.newPayment')}
        onPress={onNewRecipient}
        className="h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white/[0.42] active:scale-[0.97]"
      >
        <GlassBackdrop intensity={18} />
        <Icon as={Plus} size={20} className="text-brand" />
      </Pressable>
    </View>
  );
}
