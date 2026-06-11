import { Chip } from "@flama/design-system-mobile/chip";
import { Text } from "@flama/design-system-mobile/text";
import { cn } from "@flama/design-system-mobile/utils";
import { View } from "react-native";

type QuizQuestionProps = {
  /** 0-based position of the word being asked about. */
  index: number;
  choices: string[];
  correct: string;
  selected?: string;
  onSelect: (word: string) => void;
};

/**
 * One backup-quiz question: "Word #n" plus a row of candidate-word chips
 * that tint green / red once chosen.
 */
export function QuizQuestion({
  index,
  choices,
  correct,
  selected,
  onSelect,
}: QuizQuestionProps) {
  return (
    <View>
      <Text className="mb-2 text-[13px] font-semibold text-muted-foreground">
        Word #{index + 1}
      </Text>
      <View className="flex-row gap-2.5">
        {choices.map((word) => {
          const chosen = selected === word;
          const isCorrect = chosen && word === correct;
          const isWrong = chosen && word !== correct;
          return (
            <View key={word} className="flex-1">
              <Chip
                variant="outline"
                onPress={() => onSelect(word)}
                className={cn(
                  "w-full px-1.5",
                  isCorrect &&
                    "border-positive bg-positive-soft active:bg-positive-soft",
                  isWrong &&
                    "border-destructive bg-destructive-soft active:bg-destructive-soft",
                )}
              >
                <Text
                  numberOfLines={1}
                  className={cn(
                    isCorrect && "text-positive-soft-foreground",
                    isWrong && "text-destructive-soft-foreground",
                  )}
                >
                  {word}
                </Text>
              </Chip>
            </View>
          );
        })}
      </View>
    </View>
  );
}
