import * as React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";
import { Text } from "./text";

// MnemonicGrid / MnemonicWord — the recovery-phrase grid. Each cell is a
// muted chip with a right-aligned mono index; words render bold when
// revealed and as five masking dots otherwise. The grid wraps cells into
// `columns` (default 2) using flex-basis.
type MnemonicWordProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  /** 1-based position in the phrase. */
  index: number;
  word: string;
  revealed?: boolean;
};

function MnemonicWord({
  index,
  word,
  revealed,
  className,
  ...props
}: MnemonicWordProps) {
  return (
    <View
      className={cn(
        "bg-muted h-[46px] flex-row items-center gap-2 rounded-md px-3",
        className,
      )}
      {...props}
    >
      <Text className="text-muted-foreground w-4 text-right font-mono text-xs">
        {index}
      </Text>
      {revealed ? (
        <Text
          numberOfLines={1}
          className="text-foreground text-[15px] font-semibold"
        >
          {word}
        </Text>
      ) : (
        <View className="flex-row items-center gap-1">
          {Array.from({ length: 5 }).map((_, dot) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: static decorative dots
              key={dot}
              className="bg-input h-[5px] w-[5px] rounded-full"
            />
          ))}
        </View>
      )}
    </View>
  );
}

type MnemonicGridProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  words: string[];
  revealed?: boolean;
  /** Number of columns the words wrap into. */
  columns?: number;
};

function MnemonicGrid({
  words,
  revealed,
  columns = 2,
  className,
  ...props
}: MnemonicGridProps) {
  // flex-basis is derived from the numeric `columns` prop, leaving room
  // for the wrap gap; genuinely dynamic, so it stays a style value.
  const basis = `${Math.floor(100 / columns) - 2}%` as const;
  return (
    <View
      className={cn("w-full flex-row flex-wrap gap-2", className)}
      {...props}
    >
      {words.map((word, i) => (
        <MnemonicWord
          key={`${i}-${word}`}
          index={i + 1}
          word={word}
          revealed={revealed}
          className="grow"
          style={{ flexBasis: basis }}
        />
      ))}
    </View>
  );
}

export type { MnemonicGridProps, MnemonicWordProps };
export { MnemonicGrid, MnemonicWord };
