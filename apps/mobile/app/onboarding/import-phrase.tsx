import { Callout } from '@flama/design-system-mobile/callout';
import { Chip } from '@flama/design-system-mobile/chip';
import { MnemonicInput } from '@flama/design-system-mobile/mnemonic-input';
import { SegmentedControl } from '@flama/design-system-mobile/segmented-control';
import { isValidMnemonicWord } from '@flama/frontend';
import { useImportWallet } from '@flama/frontend/react';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { ClipboardPaste } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { OnboardingStepScreen } from '../../components/auth/onboarding-step-screen';
import { buildRoute } from '../../lib/routes';

type WordCount = 12 | 24;

const emptyWords = (count: WordCount) => Array.from({ length: count }, () => '');

/** Empty cells are neutral; only filled non-wordlist words flag red. */
const validateWord = (word: string): boolean | null => (word ? isValidMnemonicWord(word) : null);

export default function ImportPhraseScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [wordCount, setWordCount] = React.useState<WordCount>(12);
  const [words, setWords] = React.useState<string[]>(() => emptyWords(12));

  const importWallet = useImportWallet({
    onSuccess: () => router.replace(buildRoute.onboardingSuccess('phrase')),
  });

  const setCount = (value: string) => {
    const count = Number(value) as WordCount;
    if (count === wordCount) return;
    setWordCount(count);
    // Keep what's already typed when growing; trim when shrinking.
    setWords((prev) => emptyWords(count).map((_, i) => prev[i] ?? ''));
  };

  const pasteFromClipboard = async () => {
    const text = (await Clipboard.getStringAsync()).trim();
    if (!text) return;
    const parts = text.split(/\s+/).slice(0, wordCount);
    setWords((prev) => prev.map((word, i) => parts[i]?.toLowerCase() ?? word));
  };

  const filled = words.filter((w) => w).length;
  const anyInvalid = words.some((w) => validateWord(w) === false);
  const allValid = filled === wordCount && !anyInvalid;

  const confirm = () => {
    if (!allValid || importWallet.isPending) return;
    importWallet.mutate(words.join(' '));
  };

  return (
    <OnboardingStepScreen
      step={3}
      title={t('onboarding.importPhrase.title')}
      subtitle={t('onboarding.importPhrase.subtitle')}
      cta={{
        label: importWallet.isPending
          ? t('onboarding.common.importing')
          : allValid
            ? t('onboarding.common.continue')
            : t('onboarding.importPhrase.ctaProgress', {
                filled,
                total: wordCount,
              }),
        disabled: !allValid || importWallet.isPending,
        onPress: confirm,
      }}
    >
      <View className="mt-5 mb-4 flex-row items-center justify-between gap-3">
        <SegmentedControl
          options={[
            { value: '12', label: t('onboarding.common.words12') },
            { value: '24', label: t('onboarding.common.words24') },
          ]}
          value={String(wordCount)}
          onValueChange={setCount}
        />
        <Chip size="sm" icon={ClipboardPaste} onPress={pasteFromClipboard}>
          {t('onboarding.common.paste')}
        </Chip>
      </View>

      <MnemonicInput words={words} onChangeWords={setWords} validateWord={validateWord} />

      <View className="mt-4">
        {anyInvalid || importWallet.isError ? (
          <Callout variant="negative">
            {importWallet.isError
              ? t('onboarding.importPhrase.errorImport')
              : t('onboarding.importPhrase.errorInvalid')}
          </Callout>
        ) : (
          <Callout variant="neutral">{t('onboarding.importPhrase.securityNote')}</Callout>
        )}
      </View>
    </OnboardingStepScreen>
  );
}
