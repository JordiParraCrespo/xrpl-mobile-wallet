import { Badge } from '@flama/design-system-mobile/badge';
import { Button } from '@flama/design-system-mobile/button';
import { FeatureRow } from '@flama/design-system-mobile/feature-row';
import { Icon } from '@flama/design-system-mobile/icon';
import { Text } from '@flama/design-system-mobile/text';
import { StatusBar } from 'expo-status-bar';
import { Bell } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassIconDisc } from '../../components/drops/droppoints/glass-icon-disc';
import { DROPPOINTS_PERKS } from '../../components/drops/droppoints/perks';
import { LightWashBackground } from '../../components/drops/light-wash-background';

/**
 * DropPoints — the rewards-programme teaser (`drops.html · drops/drops-app.jsx`).
 *
 * A pre-launch "coming soon" screen that still earns its tab: a frosted-glass
 * points crest and COMING SOON pill, the serif title, the three perks, and a
 * "Notify me" button that confirms in place. Built over the light indigo wash
 * from the DS glass/serif primitives; the bottom tab bar comes from `(tabs)`.
 */
export default function DropPointsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [notified, setNotified] = React.useState(false);

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <LightWashBackground />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 56,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 28,
          alignItems: 'center',
        }}
      >
        <GlassIconDisc />

        <Badge variant="glass" className="mt-[26px]">
          <Text>{t('droppoints.comingSoon')}</Text>
        </Badge>

        <Text
          className="font-display text-foreground mt-4 text-center"
          style={{ fontSize: 38, lineHeight: 40, letterSpacing: -0.6 }}
        >
          {t('droppoints.title')}
        </Text>

        <Text
          className="text-muted-foreground mt-3 text-center text-base leading-6"
          style={{ maxWidth: 300 }}
        >
          {t('droppoints.subtitle')}
        </Text>

        <View className="mt-7 w-full gap-2.5" style={{ maxWidth: 320 }}>
          {DROPPOINTS_PERKS.map((perk) => (
            <FeatureRow
              key={perk.key}
              circle
              tone="brand"
              icon={perk.icon}
              title={t(`droppoints.perks.${perk.key}.title`)}
              description={t(`droppoints.perks.${perk.key}.description`)}
            />
          ))}
        </View>

        <Button
          size="lg"
          variant={notified ? 'secondary' : 'default'}
          className="mt-[26px]"
          onPress={() => setNotified(true)}
        >
          {notified ? <Icon as={Bell} size={18} /> : null}
          <Text>{notified ? t('droppoints.notified') : t('droppoints.notify')}</Text>
        </Button>
      </ScrollView>
    </View>
  );
}
