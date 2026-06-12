import { ChevronLeft } from "lucide-react-native";
import type * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

// PinKeypad — circular numeric keypad for passcode entry (onboarding
// set-passcode, unlock). 72px white circle keys with a hairline border,
// body digits at weight 500 (not the display serif — this is input, not
// money), a ghost backspace key, and the Drops press feedback (scale +
// soft tint). Distinct from `Keypad`, the flat amount-entry grid.
const ROWS: (string | "back" | null)[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [null, "0", "back"],
];

type PinKeypadProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  /** Receives "0"–"9". */
  onKey: (digit: string) => void;
  onBackspace: () => void;
  /** Ignore presses (mid-commit, error shake, success hand-off). */
  disabled?: boolean;
};

function PinKeypad({
  onKey,
  onBackspace,
  disabled = false,
  className,
  ...props
}: PinKeypadProps) {
  return (
    <View
      className={cn("w-full max-w-[290px] gap-4 self-center", className)}
      {...props}
    >
      {ROWS.map((row) => (
        <View key={row.join("-")} className="flex-row justify-between">
          {row.map((key) =>
            key === null ? (
              <View key="blank" className="h-[72px] w-[72px]" />
            ) : key === "back" ? (
              <Pressable
                key={key}
                role="button"
                accessibilityLabel="Delete"
                disabled={disabled}
                onPress={onBackspace}
                className="h-[72px] w-[72px] items-center justify-center rounded-full active:scale-[0.94] active:bg-secondary"
              >
                <Icon as={ChevronLeft} size={26} className="text-foreground" />
              </Pressable>
            ) : (
              <Pressable
                key={key}
                role="button"
                disabled={disabled}
                onPress={() => onKey(key)}
                className="h-[72px] w-[72px] items-center justify-center rounded-full border-hairline border-border bg-card active:scale-[0.94] active:bg-secondary"
              >
                <Text className="text-[27px] font-medium tracking-[0.5px] text-foreground">
                  {key}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

export type { PinKeypadProps };
export { PinKeypad };
