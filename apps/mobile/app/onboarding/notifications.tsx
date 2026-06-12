import { Button } from '@flama/design-system-mobile/button';
import { Icon } from '@flama/design-system-mobile/icon';
import { ScreenHeader } from '@flama/design-system-mobile/screen-header';
import { Text } from '@flama/design-system-mobile/text';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { Bell, type LucideIcon, ShieldCheck, Zap } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Routes } from '../../lib/routes';

const POINTS: { key: 'alerts' | 'security' | 'noise'; icon: LucideIcon }[] = [
  { key: 'alerts', icon: Zap },
  { key: 'security', icon: ShieldCheck },
  { key: 'noise', icon: Bell },
];

/**
 * Notifications permission ask — the last onboarding beat, after the success
 * screen showed the wallet exists and before the hub. It's the one screen
 * about the app rather than the wallet, so it sits outside the security and
 * keys blocks; "Not now" is always an equal exit. Design:
 * onboarding-notifications.html.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [requesting, setRequesting] = React.useState(false);

  const finish = () => router.replace(Routes.Home);

  const enable = async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      // The OS prompt failing is not a reason to trap the user in onboarding.
    }
    finish();
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 8 }} className="px-6">
        <ScreenHeader onBack={finish} />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-2 pt-3">
        <View className="h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-brand-soft">
          <Icon as={Bell} size={28} className="text-brand-soft-foreground" />
        </View>
        <Text className="mt-5 font-display text-[30px] leading-[34px] tracking-[-0.5px] text-foreground">
          {t('onboarding.notifications.title')}
        </Text>
        <Text className="mt-2.5 text-[15px] leading-6 text-muted-foreground">
          {t('onboarding.notifications.subtitle')}
        </Text>

        <View className="mt-[22px]">
          {POINTS.map((point, i) => (
            <View
              key={point.key}
              className={
                i ? 'flex-row gap-3.5 border-t border-border py-3.5' : 'flex-row gap-3.5 py-3.5'
              }
            >
              <View className="h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-secondary">
                <Icon as={point.icon} size={19} className="text-foreground" />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-[15.5px] font-semibold text-foreground">
                  {t(`onboarding.notifications.points.${point.key}.title`)}
                </Text>
                <Text className="mt-0.5 text-[13.5px] leading-[19px] text-muted-foreground">
                  {t(`onboarding.notifications.points.${point.key}.description`)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="gap-2.5 px-6 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button variant="brand" size="lg" className="w-full" disabled={requesting} onPress={enable}>
          <Text>{t('onboarding.notifications.enable')}</Text>
        </Button>
        <Button variant="ghost" size="lg" className="w-full" disabled={requesting} onPress={finish}>
          <Text>{t('onboarding.notifications.skip')}</Text>
        </Button>
      </View>
    </View>
  );
}
