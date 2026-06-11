import { Button } from "@flama/design-system-mobile/button";
import { Icon } from "@flama/design-system-mobile/icon";
import { Text } from "@flama/design-system-mobile/text";
import { cn } from "@flama/design-system-mobile/utils";
import { useImportWallet } from "@flama/frontend/react";
import { Redirect, useRouter } from "expo-router";
import { ShieldCheck, TriangleAlert } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreateWallet } from "../../../components/drops/create-wallet";
import { StepHeader } from "../../../components/drops/step-header";
import { buildRoute, Routes } from "../../../lib/routes";

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
  const insets = useSafeAreaInsets();
  const { words, reset } = useCreateWallet();

  const quiz = React.useMemo(() => (words ? buildQuiz(words) : []), [words]);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});

  const importWallet = useImportWallet({
    onSuccess: () => {
      reset();
      router.replace(buildRoute.onboardingSuccess("phrase"));
    },
  });

  // If the draft is gone (e.g. deep-linked here), restart at reveal.
  if (!words) {
    return <Redirect href={Routes.OnboardingRevealPhrase} />;
  }

  const allCorrect =
    quiz.length > 0 && quiz.every((q) => answers[q.index] === q.correct);
  const anyWrong = quiz.some(
    (q) => answers[q.index] && answers[q.index] !== q.correct,
  );

  const confirm = () => {
    if (!allCorrect || importWallet.isPending) return;
    importWallet.mutate(words.join(" "));
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 8 }} className="px-6">
        <StepHeader step={3} />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-2 pt-3">
        <Text className="font-display text-[30px] leading-[34px] tracking-[-0.5px] text-foreground">
          Confirm your backup
        </Text>
        <Text className="mt-2.5 text-[15px] leading-6 text-muted-foreground">
          Tap the right word for each position to prove you've saved your
          phrase.
        </Text>

        <View className="mt-6 gap-5">
          {quiz.map((q) => (
            <View key={q.index}>
              <Text className="mb-2 text-[13px] font-semibold text-muted-foreground">
                Word #{q.index + 1}
              </Text>
              <View className="flex-row gap-2.5">
                {q.choices.map((w) => {
                  const chosen = answers[q.index] === w;
                  const correct = chosen && w === q.correct;
                  const wrong = chosen && w !== q.correct;
                  return (
                    <Pressable
                      key={w}
                      onPress={() =>
                        setAnswers((a) => ({ ...a, [q.index]: w }))
                      }
                      className={cn(
                        "h-12 flex-1 items-center justify-center rounded-xl border px-1.5",
                        correct && "border-positive bg-positive-soft",
                        wrong && "border-destructive bg-destructive-soft",
                        !chosen && "border-border bg-card",
                      )}
                    >
                      <Text
                        numberOfLines={1}
                        className={cn(
                          "text-[15px] font-semibold",
                          correct && "text-positive-soft-foreground",
                          wrong && "text-destructive-soft-foreground",
                          !chosen && "text-foreground",
                        )}
                      >
                        {w}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <View className="mt-[18px]">
          {anyWrong || importWallet.isError ? (
            <View className="flex-row items-start gap-2.5 rounded-xl bg-destructive-soft p-3.5">
              <Icon
                as={TriangleAlert}
                size={18}
                className="mt-px text-destructive"
              />
              <Text className="flex-1 text-[13px] font-medium leading-[19px] text-destructive-soft-foreground">
                {importWallet.isError
                  ? "Something went wrong creating your wallet. Please try again."
                  : "That's not the right word for that position. Check your written backup and try again."}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-start gap-2.5 rounded-xl bg-secondary p-3.5">
              <Icon
                as={ShieldCheck}
                size={18}
                className="mt-px text-muted-foreground"
              />
              <Text className="flex-1 text-[13px] leading-[19px] text-muted-foreground">
                Almost there. Confirming proves your phrase is safely written
                down.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + 16 }} className="px-6 pt-3">
        <Button
          variant="brand"
          size="lg"
          className="w-full"
          disabled={!allCorrect || importWallet.isPending}
          onPress={confirm}
        >
          <Text>
            {importWallet.isPending
              ? "Creating wallet…"
              : allCorrect
                ? "Confirm & finish"
                : "Select each word"}
          </Text>
        </Button>
      </View>
    </View>
  );
}
