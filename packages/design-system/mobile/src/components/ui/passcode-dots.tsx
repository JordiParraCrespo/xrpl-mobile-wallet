import * as React from "react";
import type { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { cn } from "../../lib/utils";

// PasscodeDots — the 6-dot passcode indicator. Empty dots are hollow,
// filled dots swell to the brand color; on error the whole row turns
// negative and shakes (matches the prototype's 0.42s pinShake).
type PasscodeDotsProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  length: number;
  filled: number;
  error?: boolean;
};

function PasscodeDots({
  length,
  filled,
  error = false,
  className,
  ...props
}: PasscodeDotsProps) {
  const shake = useSharedValue(0);

  React.useEffect(() => {
    if (!error) return;
    shake.value = withSequence(
      withTiming(-9, { duration: 84 }),
      withTiming(8, { duration: 84 }),
      withTiming(-6, { duration: 84 }),
      withTiming(4, { duration: 84 }),
      withTiming(0, { duration: 84 }),
    );
  }, [error, shake]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Animated.View
      className={cn("flex-row justify-center gap-4", className)}
      style={shakeStyle}
      {...props}
    >
      {Array.from({ length }).map((_, i) => {
        const on = i < filled;
        return (
          <Animated.View
            // biome-ignore lint/suspicious/noArrayIndexKey: positional passcode dots
            key={i}
            className={cn(
              "h-[15px] w-[15px] rounded-full border-2",
              error
                ? "border-destructive bg-destructive"
                : on
                  ? "scale-[1.08] border-brand bg-brand"
                  : "border-border bg-transparent",
            )}
          />
        );
      })}
    </Animated.View>
  );
}

export type { PasscodeDotsProps };
export { PasscodeDots };
