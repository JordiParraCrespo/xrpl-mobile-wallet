import { TextInput, View } from "react-native";
import { cn } from "../../lib/utils";
import { Text } from "./text";

// MnemonicInput — the editable counterpart of MnemonicGrid: a grid of
// word cells (right-aligned mono index + text input) for entering a
// recovery phrase. Pasting a multi-word value into any cell distributes
// the words forward from that position. `validateWord` tints a cell's
// border and text red when a word is invalid (null = neutral).
type MnemonicInputProps = {
  words: string[];
  onChangeWords: (words: string[]) => void;
  /** Per-word validity: false flags the cell red; true/null are neutral. */
  validateWord?: (word: string) => boolean | null;
  /** Number of columns the cells wrap into. */
  columns?: number;
  className?: string;
};

function MnemonicInput({
  words,
  onChangeWords,
  validateWord,
  columns = 2,
  className,
}: MnemonicInputProps) {
  // flex-basis derived from the numeric `columns` prop (see MnemonicGrid).
  const basis = `${Math.floor(100 / columns) - 2}%` as const;

  const setWord = (index: number, value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    const next = words.slice();
    if (parts.length > 1) {
      // A multi-word paste fills the following cells too.
      for (let k = 0; k < parts.length && index + k < next.length; k++) {
        next[index + k] = parts[k].toLowerCase();
      }
    } else {
      next[index] = value.replace(/\s/g, "").toLowerCase();
    }
    onChangeWords(next);
  };

  return (
    <View className={cn("w-full flex-row flex-wrap gap-2", className)}>
      {words.map((word, i) => {
        const invalid = validateWord?.(word) === false;
        return (
          <View
            // biome-ignore lint/suspicious/noArrayIndexKey: cells are positional by design
            key={i}
            className={cn(
              "h-[46px] grow flex-row items-center gap-2 rounded-md border bg-card px-3",
              invalid ? "border-destructive" : "border-border",
            )}
            style={{ flexBasis: basis }}
          >
            <Text className="w-4 text-right font-mono text-xs text-muted-foreground">
              {i + 1}
            </Text>
            <TextInput
              value={word}
              onChangeText={(value) => setWord(i, value)}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              className={cn(
                "h-full min-w-0 flex-1 p-0 font-sans text-[15px] font-medium",
                invalid ? "text-destructive" : "text-foreground",
              )}
            />
          </View>
        );
      })}
    </View>
  );
}

export type { MnemonicInputProps };
export { MnemonicInput };
