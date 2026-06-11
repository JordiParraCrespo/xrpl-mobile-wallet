import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { cn } from "../../lib/utils";
import { GlassBackdrop } from "./glass-panel";
import { Icon } from "./icon";

// SuccessTick — animated confirmation tick. The circle pops in
// (scale 0.5 → 1.08 → 1 with a fade, ~500ms), then the white check
// fades / scales in slightly delayed. `glass` sits on gradient or
// dark surfaces; `positive` is the solid success-screen disc.
const successTickVariants = cva(
  "items-center justify-center overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        glass: "border border-white/20 bg-white/10",
        positive: "bg-positive",
      },
    },
    defaultVariants: {
      variant: "positive",
    },
  },
);

type SuccessTickProps = React.ComponentProps<typeof View> &
  VariantProps<typeof successTickVariants> & {
    size?: number;
  };

function SuccessTick({
  size = 76,
  variant,
  className,
  ...props
}: SuccessTickProps) {
  const circleScale = useSharedValue(0.5);
  const circleOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.4);
  const checkOpacity = useSharedValue(0);

  React.useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    circleOpacity.value = withTiming(1, { duration: 240, easing: ease });
    circleScale.value = withSequence(
      withTiming(1.08, { duration: 300, easing: ease }),
      withTiming(1, { duration: 200, easing: ease }),
    );
    checkOpacity.value = withDelay(
      220,
      withTiming(1, { duration: 220, easing: ease }),
    );
    checkScale.value = withDelay(
      220,
      withTiming(1, { duration: 280, easing: ease }),
    );
  }, [circleScale, circleOpacity, checkScale, checkOpacity]);

  const circleStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <Animated.View
      className={cn(successTickVariants({ variant }), className)}
      style={[{ width: size, height: size }, circleStyle]}
      {...props}
    >
      {variant === "glass" ? <GlassBackdrop /> : null}
      <Animated.View style={checkStyle}>
        <Icon
          as={Check}
          size={size * 0.5}
          strokeWidth={2.6}
          className="text-white"
        />
      </Animated.View>
    </Animated.View>
  );
}

export type { SuccessTickProps };
export { SuccessTick, successTickVariants };
