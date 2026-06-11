import * as React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";
import { Text } from "./text";

// AmountDisplay — the big flow amount (send / swap / add money).
// Display serif at weight 400 only; the currency symbol is a smaller
// muted companion and the optional cursor is a slim brand bar.
type AmountDisplayProps = Omit<
  React.ComponentProps<typeof View>,
  "children"
> & {
  value: string;
  symbol?: string;
  symbolPosition?: "prefix" | "suffix";
  /** Show the brand input cursor after the value. */
  showCursor?: boolean;
};

function AmountDisplay({
  value,
  symbol = "$",
  symbolPosition = "prefix",
  showCursor = false,
  className,
  ...props
}: AmountDisplayProps) {
  return (
    <View className={cn("flex-row items-baseline gap-1", className)} {...props}>
      {symbolPosition === "prefix" ? (
        <Text className="text-muted-foreground mt-2 self-start font-display text-[28px] font-normal">
          {symbol}
        </Text>
      ) : null}
      <Text className="text-foreground font-display text-[56px] font-normal leading-none tracking-[-1px] tabular-nums">
        {value}
      </Text>
      {showCursor ? (
        <View className="bg-brand h-[42px] w-0.5 self-center rounded-full" />
      ) : null}
      {symbolPosition === "suffix" ? (
        <Text className="text-muted-foreground font-display text-4xl font-normal">
          {symbol}
        </Text>
      ) : null}
    </View>
  );
}

export type { AmountDisplayProps };
export { AmountDisplay };
