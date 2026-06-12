import * as React from "react";
import type { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { cn } from "../../lib/utils";

// PasscodeDots — the 6-dot passcode indicator, themed per surface:
// light (onboarding set-passcode): hollow dots that fill brand and turn
// negative + shake on error; onDark (the unlock watercolor/gradient gate):
// solid white dots that dim when empty. The rejection shake can be driven
// either declaratively (the `error` prop) or imperatively (`ref.shake()`)
// so screens can keep their own passcode state machine.
const SHAKE_FRAMES = [-9, 8, -6, 4, 0];
const SHAKE_FRAME_MS = 84;

type PasscodeDotsHandle = {
  /** Play the rejection shake (e.g. on a wrong passcode). */
  shake: () => void;
};

type PasscodeDotsProps = Omit<React.ComponentProps<typeof View>, "children"> & {
  length: number;
  filled: number;
  /** Paint the row negative and shake while true. */
  error?: boolean;
  /** Solid white dots for dark / immersive surfaces (the unlock gate). */
  onDark?: boolean;
};

const PasscodeDots = React.forwardRef<PasscodeDotsHandle, PasscodeDotsProps>(
  function PasscodeDots(
    { length, filled, error = false, onDark = false, className, ...props },
    ref,
  ) {
    const shake = useSharedValue(0);

    const playShake = React.useCallback(() => {
      shake.value = 0;
      shake.value = withSequence(
        ...SHAKE_FRAMES.map((frame) =>
          withTiming(frame, { duration: SHAKE_FRAME_MS }),
        ),
      );
    }, [shake]);

    React.useImperativeHandle(ref, () => ({ shake: playShake }), [playShake]);

    React.useEffect(() => {
      if (error) playShake();
    }, [error, playShake]);

    const shakeStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shake.value }],
    }));

    return (
      <Animated.View
        className={cn(
          "flex-row justify-center",
          onDark ? "gap-[22px]" : "gap-4",
          className,
        )}
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
                "rounded-full",
                onDark
                  ? cn(
                      "h-[17px] w-[17px]",
                      error
                        ? "bg-destructive"
                        : on
                          ? "bg-white"
                          : "scale-[0.92] bg-white/40",
                    )
                  : cn(
                      "h-[15px] w-[15px] border-2",
                      error
                        ? "border-destructive bg-destructive"
                        : on
                          ? "scale-[1.08] border-brand bg-brand"
                          : "border-border bg-transparent",
                    ),
              )}
            />
          );
        })}
      </Animated.View>
    );
  },
);

export type { PasscodeDotsHandle, PasscodeDotsProps };
export { PasscodeDots };
