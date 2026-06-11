import type { BadgeProps } from '@flama/design-system-mobile/badge';
import { BottomSheet } from '@flama/design-system-mobile/bottom-sheet';
import { Button } from '@flama/design-system-mobile/button';
import { Icon } from '@flama/design-system-mobile/icon';
import { ImportMethodCard } from '@flama/design-system-mobile/import-method-card';
import { Text } from '@flama/design-system-mobile/text';
import { useRouter } from 'expo-router';
import { FileText, Hash, Info, KeyRound, type LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { OnboardingStepScreen } from '../../components/auth/onboarding-step-screen';
import { Routes } from '../../lib/routes';

type Method = {
  id: 'phrase' | 'seed' | 'secret';
  icon: LucideIcon;
  /** i18n key for the compatibility badge text. */
  badgeKey: 'onboarding.import.allNetworks' | 'onboarding.common.xrplOnly';
  badgeTone: BadgeProps['variant'];
  route: Routes;
};

const METHODS: Method[] = [
  {
    id: 'phrase',
    icon: FileText,
    badgeKey: 'onboarding.import.allNetworks',
    badgeTone: 'positive',
    route: Routes.OnboardingImportPhrase,
  },
  {
    id: 'seed',
    icon: KeyRound,
    badgeKey: 'onboarding.common.xrplOnly',
    badgeTone: 'secondary',
    route: Routes.OnboardingImportSeed,
  },
  {
    id: 'secret',
    icon: Hash,
    badgeKey: 'onboarding.common.xrplOnly',
    badgeTone: 'secondary',
    route: Routes.OnboardingImportSecretNumbers,
  },
];

export default function ImportPickerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<Method | null>(null);
  const [helpOpen, setHelpOpen] = React.useState(false);

  return (
    <OnboardingStepScreen
      step={1}
      title={t('onboarding.import.title')}
      subtitle={t('onboarding.import.subtitle')}
      cta={{
        label: t('onboarding.common.continue'),
        disabled: !selected,
        onPress: () => selected && router.push(selected.route),
      }}
    >
      <View className="mt-6 gap-3">
        {METHODS.map((method) => (
          <ImportMethodCard
            key={method.id}
            icon={method.icon}
            title={t(`onboarding.import.methods.${method.id}.title`)}
            description={t(`onboarding.import.methods.${method.id}.description`)}
            badge={t(method.badgeKey)}
            badgeTone={method.badgeTone}
            selected={selected?.id === method.id}
            onPress={() => setSelected(method)}
          />
        ))}
      </View>

      <Pressable
        onPress={() => setHelpOpen(true)}
        className="mt-5 flex-row items-center gap-1.5 self-center active:opacity-70"
      >
        <Icon as={Info} size={16} className="text-info" />
        <Text className="text-sm font-semibold text-info">{t('onboarding.import.helper')}</Text>
      </Pressable>

      <BottomSheet open={helpOpen} onClose={() => setHelpOpen(false)}>
        <Text className="mb-1 font-display text-[22px] tracking-[-0.3px] text-foreground">
          {t('onboarding.import.helper')}
        </Text>
        {METHODS.map((method) => (
          <View key={method.id} className="flex-row gap-3 border-t border-border py-3">
            <View className="h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-secondary">
              <Icon as={method.icon} size={19} className="text-foreground" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[15px] font-semibold text-foreground">
                {t(`onboarding.import.methods.${method.id}.title`)}
              </Text>
              <Text className="mt-0.5 text-[13px] leading-[19px] text-muted-foreground">
                {t(`onboarding.import.methods.${method.id}.help`)}
              </Text>
            </View>
          </View>
        ))}
        <Button
          variant="secondary"
          size="lg"
          className="mt-3 w-full"
          onPress={() => setHelpOpen(false)}
        >
          <Text>{t('onboarding.import.gotIt')}</Text>
        </Button>
      </BottomSheet>
    </OnboardingStepScreen>
  );
}
