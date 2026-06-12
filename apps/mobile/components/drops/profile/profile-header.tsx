import { GlassPanel } from '@flama/design-system-mobile/glass-panel';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { PROFILE_BRAND, type ProfileTheme } from './profile-theme';

type ProfileHeaderProps = {
  theme: ProfileTheme;
  onBack?: () => void;
  onUpgrade?: () => void;
};

/**
 * Profile top bar: a glass back disc on the left and the solid-brand "Upgrade"
 * pill on the right, matching the Drops profile design header.
 */
export function ProfileHeader({ theme, onBack, onUpgrade }: ProfileHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 18 }}>
      <Pressable accessibilityLabel={t('common.back')} onPress={onBack}>
        {({ pressed }) => (
          <GlassPanel
            padded={false}
            intensity={theme.blur}
            tint={theme.blurTint}
            className="items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              backgroundColor: theme.glassBg,
              borderColor: theme.glassBorder,
              opacity: pressed ? 0.7 : 1,
            }}
          >
            <Icon as={ChevronLeft} size={20} color={theme.fg} />
          </GlassPanel>
        )}
      </Pressable>

      <Pressable onPress={onUpgrade}>
        {({ pressed }) => (
          <View
            className="flex-row items-center rounded-full"
            style={{
              gap: 7,
              height: 44,
              paddingHorizontal: 18,
              backgroundColor: PROFILE_BRAND,
              opacity: pressed ? 0.85 : 1,
            }}
          >
            <Icon as={Sparkles} size={16} color="#ffffff" />
            <Text className="font-sans text-white" style={{ fontSize: 14.5, fontWeight: '600' }}>
              {t('profile.upgrade')}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
