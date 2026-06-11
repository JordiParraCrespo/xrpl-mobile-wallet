import * as React from "react";
import { Animated, View } from "react-native";
import { UNLOCK_LIGHT } from "./unlock-theme";

export type PasscodeDotsHandle = {
  /** Play the rejection shake (e.g. on a wrong passcode). */
  shake: () => void;
};

type PasscodeDotsProps = {
  /** Total number of dots (the passcode length). */
  length: number;
  /** How many dots are filled (the digits entered so far). */
  filled: number;
};

const SHAKE_FRAMES = [-9, 8, -6, 4, 0];

/**
 * The passcode progress indicator: a row of dots that fill as digits are
 * entered. Exposes an imperative `shake()` for the rejection animation so the
 * screen can keep its passcode state without owning the animation.
 */
export const PasscodeDots = React.forwardRef<
  PasscodeDotsHandle,
  PasscodeDotsProps
>(function PasscodeDots({ length, filled }, ref) {
  const translateX = React.useRef(new Animated.Value(0)).current;

  React.useImperativeHandle(
    ref,
    () => ({
      shake() {
        translateX.setValue(0);
        Animated.sequence(
          SHAKE_FRAMES.map((toValue) =>
            Animated.timing(translateX, {
              toValue,
              duration: 84,
              useNativeDriver: true,
            }),
          ),
        ).start();
      },
    }),
    [translateX],
  );

  return (
    <Animated.View
      style={{ flexDirection: "row", gap: 22, transform: [{ translateX }] }}
    >
      {Array.from({ length }).map((_, i) => {
        const on = i < filled;
        return (
          <View
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length dot row
            key={i}
            style={{
              width: 17,
              height: 17,
              borderRadius: 17,
              backgroundColor: on ? UNLOCK_LIGHT.dotOn : UNLOCK_LIGHT.dotOff,
              transform: [{ scale: on ? 1 : 0.92 }],
            }}
          />
        );
      })}
    </Animated.View>
  );
});
