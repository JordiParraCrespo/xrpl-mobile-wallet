import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { cn } from "../../lib/utils";
import { GlassBackdrop } from "./glass-panel";
import { Icon } from "./icon";

// SuccessTick — animated confirmation tick. The circle pops in
// (scale 0.5 → 1.08 → 1 with a fade, ~500ms), then the white check
// fades / scales in slightly delayed. `glass` sits on gradient or
// dark surfaces; `positive` is the solid success-screen disc.
// With `glow`, a soft radial light blooms behind the disc first and
// keeps breathing afterwards — the tick emerges out of the light.
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

/** Halo diameter relative to the disc. */
const GLOW_RATIO = 2.8;
/** How long the light leads before the disc starts. */
const GLOW_LEAD_MS = 220;

type SuccessTickProps = React.ComponentProps<typeof View> &
  VariantProps<typeof successTickVariants> & {
    size?: number;
    /** Bloom a breathing background light behind the tick. */
    glow?: boolean;
    /**
     * Halo tint. Defaults by variant: white for `glass` (dark surfaces),
     * the positive green for `positive` (light surfaces, where a white
     * glow would be invisible).
     */
    glowColor?: string;
  };

function SuccessTick({
  size = 76,
  variant,
  glow = false,
  glowColor,
  className,
  ...props
}: SuccessTickProps) {
  const haloColor =
    glowColor ?? (variant === "positive" ? "#12b886" : "#ffffff");
  const circleScale = useSharedValue(0.5);
  const circleOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.4);
  const checkOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    const breathe = Easing.inOut(Easing.sin);
    const lead = glow ? GLOW_LEAD_MS : 0;

    if (glow) {
      // The light arrives first, then settles into a slow breathe.
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 320, easing: ease }),
        withRepeat(
          withSequence(
            withTiming(0.55, { duration: 1500, easing: breathe }),
            withTiming(1, { duration: 1500, easing: breathe }),
          ),
          -1,
          false,
        ),
      );
      glowScale.value = withSequence(
        withTiming(1, { duration: 420, easing: ease }),
        withRepeat(
          withSequence(
            withTiming(1.12, { duration: 1500, easing: breathe }),
            withTiming(1, { duration: 1500, easing: breathe }),
          ),
          -1,
          false,
        ),
      );
    }

    circleOpacity.value = withDelay(
      lead,
      withTiming(1, { duration: 240, easing: ease }),
    );
    circleScale.value = withDelay(
      lead,
      withSequence(
        withTiming(1.08, { duration: 300, easing: ease }),
        withTiming(1, { duration: 200, easing: ease }),
      ),
    );
    checkOpacity.value = withDelay(
      220 + lead,
      withTiming(1, { duration: 220, easing: ease }),
    );
    checkScale.value = withDelay(
      220 + lead,
      withTiming(1, { duration: 280, easing: ease }),
    );
  }, [
    glow,
    circleScale,
    circleOpacity,
    checkScale,
    checkOpacity,
    glowScale,
    glowOpacity,
  ]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const circleStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const halo = size * GLOW_RATIO;

  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}
    >
      {glow ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              width: halo,
              height: halo,
              left: (size - halo) / 2,
              top: (size - halo) / 2,
            },
            glowStyle,
          ]}
        >
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="success-tick-glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={haloColor} stopOpacity={0.5} />
                <Stop offset="0.55" stopColor={haloColor} stopOpacity={0.16} />
                <Stop offset="1" stopColor={haloColor} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx="50%" cy="50%" r="50%" fill="url(#success-tick-glow)" />
          </Svg>
        </Animated.View>
      ) : null}
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
    </View>
  );
}

export type { SuccessTickProps };
export { SuccessTick, successTickVariants };
