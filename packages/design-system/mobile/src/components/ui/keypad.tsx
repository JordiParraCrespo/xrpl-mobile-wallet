import { Delete } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// Keypad — the shared amount-entry keypad used by Add money, Swap and
// Send. Digits set in the display serif at weight 400 (never bolded).
// Optional calculator operator row above the grid. Designed for dark
// flow surfaces: keys flash a soft white tint on press.
const KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ".",
  "0",
  "backspace",
] as const;

const OPERATORS = ["+", "−", "×", "÷", "="] as const;

type KeypadProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  /** Receives "0"–"9", ".", "backspace", or an operator glyph. */
  onKey: (key: string) => void;
  /** Show the calculator operator row above the digit grid. */
  operators?: boolean;
};

function Keypad({
  onKey,
  operators = false,
  className,
  ...props
}: KeypadProps) {
  return (
    <View className={cn("w-full", className)} {...props}>
      {operators ? (
        <View className="flex-row gap-2 px-1.5 pb-3.5">
          {OPERATORS.map((op) => (
            <Pressable
              key={op}
              role="button"
              onPress={() => onKey(op)}
              className="bg-secondary active:bg-accent h-[42px] flex-1 items-center justify-center rounded-full active:scale-[0.97]"
            >
              <Text className="text-foreground text-[19px]">{op}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View className="flex-row flex-wrap gap-y-1.5">
        {KEYS.map((key) => (
          <Pressable
            key={key}
            role="button"
            onPress={() => onKey(key)}
            className="h-[58px] basis-1/3 items-center justify-center rounded-lg active:bg-white/10"
          >
            {key === "backspace" ? (
              <Icon as={Delete} size={24} className="text-foreground" />
            ) : (
              <Text className="font-display text-foreground text-[27px] font-normal">
                {key}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/**
 * Pure reducer for a decimal amount string driven by the Keypad.
 *
 * - "backspace" trims the last character (collapsing to "0")
 * - a single "." is allowed
 * - at most 2 decimal places
 * - no duplicate leading zeros
 * - operators and unknown keys leave the value untouched
 */
function applyKeypadKey(prev: string, key: string): string {
  if (key === "backspace") return prev.length <= 1 ? "0" : prev.slice(0, -1);
  if (key === ".") return prev.includes(".") ? prev : `${prev}.`;
  if (key === "0" && prev === "0") return prev;
  if (/^[0-9]$/.test(key)) {
    const next = prev === "0" ? key : prev + key;
    const [, decimals] = next.split(".");
    if (decimals && decimals.length > 2) return prev;
    return next;
  }
  return prev; // operators: decorative
}

export type { KeypadProps };
export { applyKeypadKey, Keypad };
