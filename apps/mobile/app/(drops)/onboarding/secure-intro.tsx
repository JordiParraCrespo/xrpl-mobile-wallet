import { FeatureRow } from '@flama/design-system-mobile/feature-row';
import { useRouter } from 'expo-router';
import { Download, EyeOff, FileText, ShieldCheck } from 'lucide-react-native';
import { View } from 'react-native';
import { OnboardingStepScreen } from '../../../components/auth/onboarding-step-screen';
import { Routes } from '../../../lib/routes';

const POINTS = [
  {
    icon: FileText,
    title: "It's your master key",
    desc: 'A 12-word recovery phrase is the only way to restore this wallet — on every XRPL chain.',
  },
  {
    icon: EyeOff,
    title: 'Keep it private',
    desc: 'Anyone who sees it can move your funds. Drops will never ask for it.',
  },
  {
    icon: Download,
    title: 'Store it offline',
    desc: "Write it down on paper. Don't screenshot it or save it to the cloud.",
  },
];

export default function SecureIntroScreen() {
  const router = useRouter();

  return (
    <OnboardingStepScreen
      step={1}
      icon={ShieldCheck}
      title="Back up your new wallet"
      subtitle="You're about to create a recovery phrase. Three things to know before you do."
      cta={{
        label: 'Create recovery phrase',
        onPress: () => router.push(Routes.OnboardingRevealPhrase),
      }}
    >
      <View className="mt-5 gap-3">
        {POINTS.map((point) => (
          <FeatureRow
            key={point.title}
            icon={point.icon}
            title={point.title}
            description={point.desc}
            tone="neutral"
            circle
          />
        ))}
      </View>
    </OnboardingStepScreen>
  );
}
