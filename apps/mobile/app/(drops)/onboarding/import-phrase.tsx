import { Callout } from "@flama/design-system-mobile/callout";
import { Chip } from "@flama/design-system-mobile/chip";
import { MnemonicInput } from "@flama/design-system-mobile/mnemonic-input";
import { SegmentedControl } from "@flama/design-system-mobile/segmented-control";
import { isValidMnemonicWord } from "@flama/frontend";
import { useImportWallet } from "@flama/frontend/react";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { ClipboardPaste } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import { OnboardingStepScreen } from "../../../components/auth/onboarding-step-screen";
import { buildRoute } from "../../../lib/routes";

type WordCount = 12 | 24;

const COUNT_OPTIONS = [
  { value: "12", label: "12 words" },
  { value: "24", label: "24 words" },
];

const emptyWords = (count: WordCount) =>
  Array.from({ length: count }, () => "");

/** Empty cells are neutral; only filled non-wordlist words flag red. */
const validateWord = (word: string): boolean | null =>
  word ? isValidMnemonicWord(word) : null;

export default function ImportPhraseScreen() {
  const router = useRouter();
  const [wordCount, setWordCount] = React.useState<WordCount>(12);
  const [words, setWords] = React.useState<string[]>(() => emptyWords(12));

  const importWallet = useImportWallet({
    onSuccess: () => router.replace(buildRoute.onboardingSuccess("phrase")),
  });

  const setCount = (value: string) => {
    const count = Number(value) as WordCount;
    if (count === wordCount) return;
    setWordCount(count);
    // Keep what's already typed when growing; trim when shrinking.
    setWords((prev) => emptyWords(count).map((_, i) => prev[i] ?? ""));
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
    importWallet.mutate(words.join(" "));
  };

  return (
    <OnboardingStepScreen
      step={2}
      title="Enter your recovery phrase"
      subtitle="Type or paste your words in order. Pasting fills every field at once."
      cta={{
        label: importWallet.isPending
          ? "Importing…"
          : allValid
            ? "Continue"
            : `${filled} of ${wordCount} words`,
        disabled: !allValid || importWallet.isPending,
        onPress: confirm,
      }}
    >
      <View className="mt-5 mb-4 flex-row items-center justify-between gap-3">
        <SegmentedControl
          options={COUNT_OPTIONS}
          value={String(wordCount)}
          onValueChange={setCount}
        />
        <Chip size="sm" icon={ClipboardPaste} onPress={pasteFromClipboard}>
          Paste
        </Chip>
      </View>

      <MnemonicInput
        words={words}
        onChangeWords={setWords}
        validateWord={validateWord}
      />

      <View className="mt-4">
        {anyInvalid || importWallet.isError ? (
          <Callout variant="negative">
            {importWallet.isError
              ? "That phrase couldn't be imported. Check the words and their order, then try again."
              : "That doesn't look like a valid phrase. Check the highlighted words and their order."}
          </Callout>
        ) : (
          <Callout variant="neutral">
            Stored encrypted on this device. Your phrase never leaves it.
          </Callout>
        )}
      </View>
    </OnboardingStepScreen>
  );
}
