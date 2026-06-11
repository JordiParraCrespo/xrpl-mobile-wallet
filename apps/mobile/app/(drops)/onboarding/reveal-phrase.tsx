import { Button } from "@flama/design-system-mobile/button";
import { Icon } from "@flama/design-system-mobile/icon";
import { Text } from "@flama/design-system-mobile/text";
import { cn } from "@flama/design-system-mobile/utils";
import { useRouter } from "expo-router";
import { Eye, TriangleAlert } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useCreateWallet,
  type WordCount,
} from "../../../components/drops/create-wallet";
import { StepHeader } from "../../../components/drops/step-header";
import { Routes } from "../../../lib/routes";

const COUNTS: WordCount[] = [12, 24];

export default function RevealPhraseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { words, wordCount, generate } = useCreateWallet();
  const [revealed, setRevealed] = React.useState(false);

  // Generate the phrase the first time we land here.
  React.useEffect(() => {
    if (!words) generate(wordCount);
  }, [words, wordCount, generate]);

  const setCount = (count: WordCount) => {
    if (count === wordCount) return;
    setRevealed(false);
    generate(count);
  };

  const phrase = words ?? [];

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 8 }} className="px-6">
        <StepHeader step={2} />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-2 pt-3">
        <Text className="font-display text-[30px] leading-[34px] tracking-[-0.5px] text-foreground">
          Your recovery phrase
        </Text>
        <Text className="mt-2.5 text-[15px] leading-6 text-muted-foreground">
          Write these words down in order and keep them somewhere safe.
        </Text>

        {/* 12 / 24 segmented control */}
        <View className="mt-5 flex-row self-start rounded-full bg-secondary p-1">
          {COUNTS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCount(c)}
              className={cn(
                "rounded-full px-4 py-1.5",
                wordCount === c && "bg-background",
              )}
            >
              <Text
                className={cn(
                  "text-[13px] font-semibold",
                  wordCount === c ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {c} words
              </Text>
            </Pressable>
          ))}
        </View>

        {/* phrase grid */}
        <View className="relative mt-4">
          <View className="flex-row flex-wrap gap-2.5">
            {phrase.map((w, i) => (
              <View
                key={`${i}-${w}`}
                className="h-[46px] flex-row items-center gap-2 rounded-xl bg-secondary px-3"
                style={{ width: "47%" }}
              >
                <Text className="w-4 text-right font-mono text-xs text-muted-foreground">
                  {i + 1}
                </Text>
                {revealed ? (
                  <Text className="text-[15px] font-semibold text-foreground">
                    {w}
                  </Text>
                ) : (
                  <View className="h-1.5 w-16 rounded-full bg-muted-foreground" />
                )}
              </View>
            ))}
          </View>

          {!revealed ? (
            <Pressable
              onPress={() => setRevealed(true)}
              className="absolute inset-0 items-center justify-center gap-2 rounded-2xl bg-secondary"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-foreground">
                <Icon as={Eye} size={20} className="text-background" />
              </View>
              <Text className="text-sm font-semibold text-foreground">
                Tap to reveal
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* warning */}
        <View className="mt-4 flex-row items-start gap-2.5 rounded-xl bg-warning-soft p-3.5">
          <Icon as={TriangleAlert} size={18} className="mt-px text-warning" />
          <Text className="flex-1 text-[13px] font-medium leading-[19px] text-warning-soft-foreground">
            Never screenshot or share these words. Drops support will never ask
            for them.
          </Text>
        </View>
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + 16 }} className="px-6 pt-3">
        <Button
          variant="brand"
          size="lg"
          className="w-full"
          disabled={!revealed}
          onPress={() => router.push(Routes.OnboardingBackupQuiz)}
        >
          <Text>
            {revealed ? "I've saved my phrase" : "Reveal to continue"}
          </Text>
        </Button>
      </View>
    </View>
  );
}
