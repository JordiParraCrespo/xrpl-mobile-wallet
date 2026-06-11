import { Callout } from '@flama/design-system-mobile/callout';
import { Icon } from '@flama/design-system-mobile/icon';
import { MnemonicGrid } from '@flama/design-system-mobile/mnemonic-grid';
import { SegmentedControl } from '@flama/design-system-mobile/segmented-control';
import { Text } from '@flama/design-system-mobile/text';
import { useRouter } from 'expo-router';
import { Eye } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { useCreateWallet, type WordCount } from '../../components/auth/create-wallet';
import { OnboardingStepScreen } from '../../components/auth/onboarding-step-screen';
import { Routes } from '../../lib/routes';

export default function RevealPhraseScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { words, wordCount, generate } = useCreateWallet();
  const [revealed, setRevealed] = React.useState(false);

  // Generate the phrase the first time we land here.
  React.useEffect(() => {
    if (!words) generate(wordCount);
  }, [words, wordCount, generate]);

  const setCount = (value: string) => {
    const count = Number(value) as WordCount;
    if (count === wordCount) return;
    setRevealed(false);
    generate(count);
  };

  return (
    <OnboardingStepScreen
      step={2}
      title={t('onboarding.revealPhrase.title')}
      subtitle={t('onboarding.revealPhrase.subtitle')}
      cta={{
        label: revealed
          ? t('onboarding.revealPhrase.ctaSaved')
          : t('onboarding.revealPhrase.ctaReveal'),
        disabled: !revealed,
        onPress: () => router.push(Routes.OnboardingBackupQuiz),
      }}
    >
      <SegmentedControl
        className="mt-5"
        options={[
          { value: '12', label: t('onboarding.common.words12') },
          { value: '24', label: t('onboarding.common.words24') },
        ]}
        value={String(wordCount)}
        onValueChange={setCount}
      />

      <View className="relative mt-4">
        <MnemonicGrid words={words ?? []} revealed={revealed} />

        {!revealed ? (
          <Pressable
            onPress={() => setRevealed(true)}
            className="absolute inset-0 items-center justify-center gap-2 rounded-2xl bg-secondary"
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-foreground">
              <Icon as={Eye} size={20} className="text-background" />
            </View>
            <Text className="text-sm font-semibold text-foreground">
              {t('onboarding.revealPhrase.tapToReveal')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Callout variant="warning" className="mt-4">
        {t('onboarding.revealPhrase.warning')}
      </Callout>
    </OnboardingStepScreen>
  );
}
