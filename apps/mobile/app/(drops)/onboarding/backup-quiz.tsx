import { Callout } from '@flama/design-system-mobile/callout';
import { useImportWallet } from '@flama/frontend/react';
import { Redirect, useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { useCreateWallet } from '../../../components/auth/create-wallet';
import { OnboardingStepScreen } from '../../../components/auth/onboarding-step-screen';
import { QuizQuestion } from '../../../components/auth/quiz-question';
import { buildRoute, Routes } from '../../../lib/routes';

function shuffle<T>(items: T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Question = { index: number; correct: string; choices: string[] };

/** Three random positions, each with the correct word + two distractors. */
function buildQuiz(words: string[]): Question[] {
  const positions = shuffle(words.map((_, i) => i))
    .slice(0, 3)
    .sort((a, b) => a - b);
  return positions.map((index) => {
    const correct = words[index];
    const distractors = shuffle(words.filter((w) => w !== correct)).slice(0, 2);
    return { index, correct, choices: shuffle([correct, ...distractors]) };
  });
}

export default function BackupQuizScreen() {
  const router = useRouter();
  const { words, reset } = useCreateWallet();

  const quiz = React.useMemo(() => (words ? buildQuiz(words) : []), [words]);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});

  const importWallet = useImportWallet({
    onSuccess: () => {
      reset();
      router.replace(buildRoute.onboardingSuccess('phrase'));
    },
  });

  // If the draft is gone (e.g. deep-linked here), restart at reveal.
  if (!words) {
    return <Redirect href={Routes.OnboardingRevealPhrase} />;
  }

  const allCorrect = quiz.length > 0 && quiz.every((q) => answers[q.index] === q.correct);
  const anyWrong = quiz.some((q) => answers[q.index] && answers[q.index] !== q.correct);

  const confirm = () => {
    if (!allCorrect || importWallet.isPending) return;
    importWallet.mutate(words.join(' '));
  };

  return (
    <OnboardingStepScreen
      step={3}
      title="Confirm your backup"
      subtitle="Tap the right word for each position to prove you've saved your phrase."
      cta={{
        label: importWallet.isPending
          ? 'Creating wallet…'
          : allCorrect
            ? 'Confirm & finish'
            : 'Select each word',
        disabled: !allCorrect || importWallet.isPending,
        onPress: confirm,
      }}
    >
      <View className="mt-6 gap-5">
        {quiz.map((q) => (
          <QuizQuestion
            key={q.index}
            index={q.index}
            choices={q.choices}
            correct={q.correct}
            selected={answers[q.index]}
            onSelect={(word) => setAnswers((a) => ({ ...a, [q.index]: word }))}
          />
        ))}
      </View>

      <View className="mt-[18px]">
        {anyWrong || importWallet.isError ? (
          <Callout variant="negative">
            {importWallet.isError
              ? 'Something went wrong creating your wallet. Please try again.'
              : "That's not the right word for that position. Check your written backup and try again."}
          </Callout>
        ) : (
          <Callout variant="neutral">
            Almost there. Confirming proves your phrase is safely written down.
          </Callout>
        )}
      </View>
    </OnboardingStepScreen>
  );
}
