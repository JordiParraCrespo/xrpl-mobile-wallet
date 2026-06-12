import { FeatureRow } from '@flama/design-system-mobile/feature-row';
import { useRouter } from 'expo-router';
import { Download, EyeOff, FileText, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { OnboardingStepScreen } from '../../components/auth/onboarding-step-screen';
import { Routes } from '../../lib/routes';

const POINTS = [
  { key: 'masterKey', icon: FileText },
  { key: 'private', icon: EyeOff },
  { key: 'offline', icon: Download },
] as const;

export default function SecureIntroScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <OnboardingStepScreen
      step={4}
      totalSteps={5}
      icon={ShieldCheck}
      title={t('onboarding.secureIntro.title')}
      subtitle={t('onboarding.secureIntro.subtitle')}
      cta={{
        label: t('onboarding.secureIntro.cta'),
        onPress: () => router.push(Routes.OnboardingRevealPhrase),
      }}
    >
      <View className="mt-5 gap-3">
        {POINTS.map((point) => (
          <FeatureRow
            key={point.key}
            icon={point.icon}
            title={t(`onboarding.secureIntro.points.${point.key}.title`)}
            description={t(`onboarding.secureIntro.points.${point.key}.description`)}
            tone="neutral"
            circle
          />
        ))}
      </View>
    </OnboardingStepScreen>
  );
}
