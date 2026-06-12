import { GlassPanel } from '@flama/design-system-mobile/glass-panel';
import { Icon } from '@flama/design-system-mobile/icon';
import { IconButton } from '@flama/design-system-mobile/icon-button';
import { InitialsAvatar } from '@flama/design-system-mobile/initials-avatar';
import { Text } from '@flama/design-system-mobile/text';
import { cn } from '@flama/design-system-mobile/utils';
import { Bell, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

/**
 * Home header: avatar (→ profile), a search pill (→ search) and the
 * notifications bell with its unread dot. Frosted glass controls over the
 * dark gradient, soft ink-tinted ones on the light "Glow".
 */
export function HomeHeader({
  onProfile,
  onSearch,
  onNotifications,
}: {
  onProfile: () => void;
  onSearch: () => void;
  onNotifications: () => void;
}) {
  const dark = useColorScheme().colorScheme === 'dark';
  const { t } = useTranslation();

  const searchInner = (
    <>
      <Icon as={Search} size={18} className={dark ? 'text-white/60' : 'text-muted-foreground'} />
      <Text className={cn('text-[15px]', dark ? 'text-white/60' : 'text-muted-foreground')}>
        {t('home.hub.search')}
      </Text>
    </>
  );

  return (
    <View className="flex-row items-center gap-3 px-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.hub.profile')}
        onPress={onProfile}
        className="active:opacity-80"
      >
        <InitialsAvatar name="Jordan Pierce" size="md" color="#5b41dd" />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.hub.search')}
        onPress={onSearch}
        className="h-11 flex-1 active:opacity-80"
      >
        {dark ? (
          <GlassPanel
            variant="on-dark"
            padded={false}
            className="h-11 flex-row items-center gap-2.5 rounded-full px-4"
          >
            {searchInner}
          </GlassPanel>
        ) : (
          <View className="h-11 flex-row items-center gap-2.5 rounded-full bg-secondary px-4">
            {searchInner}
          </View>
        )}
      </Pressable>

      <IconButton
        variant={dark ? 'glass' : 'soft'}
        accessibilityLabel={t('home.hub.notifications')}
        onPress={onNotifications}
      >
        <Icon as={Bell} size={20} />
        <View
          className={cn(
            'absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-[1.5px] bg-destructive',
            dark ? 'border-[#3a2a86]' : 'border-secondary',
          )}
        />
      </IconButton>
    </View>
  );
}
