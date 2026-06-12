import { FeatureRow } from '@flama/design-system-mobile/feature-row';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyRound, Lock, Smartphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { OnboardingStepScreen } from '../../components/auth/onboarding-step-screen';
import { buildRoute, type OnboardingPath } from '../../lib/routes';

const POINTS = [
  { key: 'unlock', icon: Lock },
  { key: 'device', icon: Smartphone },
  { key: 'noReset', icon: KeyRound },
] as const;

/**
 * What the passcode is for, shown before the keypad. Pairs with set-passcode:
 * this screen explains (locks the app on this device, can't be reset), the
 * next one collects the six digits. Shares the passcode step number, so the
 * step dots don't advance between the two. The `next` param threads the
 * onboarding path (create | import) through to set-passcode.
 */
export default function BackupInfoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { next } = useLocalSearchParams<{ next?: OnboardingPath }>();
  const isImport = next === 'import';

  return (
    <OnboardingStepScreen
      step={isImport ? 1 : 2}
      totalSteps={isImport ? 3 : 4}
      icon={Lock}
      title={t('onboarding.backupInfo.title')}
      subtitle={t('onboarding.backupInfo.subtitle')}
      cta={{
        label: t('onboarding.backupInfo.cta'),
        onPress: () => router.push(buildRoute.onboardingSetPasscode(next ?? 'create')),
      }}
    >
      <View className="mt-5 gap-3">
        {POINTS.map((point) => (
          <FeatureRow
            key={point.key}
            icon={point.icon}
            title={t(`onboarding.backupInfo.points.${point.key}.title`)}
            description={t(`onboarding.backupInfo.points.${point.key}.description`)}
            tone="neutral"
            circle
          />
        ))}
      </View>
    </OnboardingStepScreen>
  );
}
