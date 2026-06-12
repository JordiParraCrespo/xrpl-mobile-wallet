import { Icon } from '@flama/design-system-mobile/icon';
import { cn } from '@flama/design-system-mobile/utils';
import { CircleCheck, Fingerprint, ScanFace } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { BiometricMethod } from '../../lib/biometrics';

/** The enrollment lifecycle the target reflects. */
export type ScanState = 'idle' | 'scanning' | 'done';

const OUTER = 168;
const DISC = 132;

/**
 * Animated biometric scan target for the onboarding enrollment screen.
 *
 * Feature-specific (it only exists to dramatize Face ID / fingerprint
 * enrollment), so it lives in the app rather than the shared design system.
 * It leans on design-system primitives (`Icon`, semantic color tokens) for
 * everything visual:
 *
 *   - idle     — the modality glyph sits calm on the brand-soft disc
 *   - scanning — a halo breathes and a light bar sweeps the sensor
 *   - done     — the disc flips to positive and a check pops in
 */
export function BiometricScanTarget({
  method,
  state,
}: {
  method: BiometricMethod;
  state: ScanState;
}) {
  const haloOpacity = useSharedValue(0);
  const haloScale = useSharedValue(0.9);
  const sweep = useSharedValue(0);
  const checkScale = useSharedValue(0.4);

  const scanning = state === 'scanning';
  const done = state === 'done';

  React.useEffect(() => {
    if (scanning) {
      const ease = Easing.inOut(Easing.sin);
      haloOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700, easing: ease }),
          withTiming(0.25, { duration: 700, easing: ease }),
        ),
        -1,
        true,
      );
      haloScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 700, easing: ease }),
          withTiming(0.94, { duration: 700, easing: ease }),
        ),
        -1,
        true,
      );
      sweep.value = withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
      return;
    }
    haloOpacity.value = withTiming(0, { duration: 200 });
    haloScale.value = withTiming(0.9, { duration: 200 });
    sweep.value = 0;
  }, [scanning, haloOpacity, haloScale, sweep]);

  React.useEffect(() => {
    if (done) {
      checkScale.value = withDelay(
        60,
        withSequence(
          withTiming(1.12, { duration: 240, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) }),
        ),
      );
    } else {
      checkScale.value = 0.4;
    }
  }, [done, checkScale]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));
  // Travel the bar across the sensor disc, fading at the extremes.
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -DISC / 2 + sweep.value * DISC }],
    opacity: sweep.value < 0.08 || sweep.value > 0.92 ? 0 : 1,
  }));
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View style={{ width: OUTER, height: OUTER }} className="items-center justify-center">
      {/* breathing halo — only visible while scanning */}
      <Animated.View
        pointerEvents="none"
        style={[{ width: OUTER, height: OUTER, borderRadius: OUTER / 2 }, haloStyle]}
        className="absolute border-2 border-brand"
      />

      <View
        style={{ width: DISC, height: DISC, borderRadius: DISC / 2 }}
        className={cn(
          'items-center justify-center overflow-hidden',
          done ? 'bg-positive-soft' : 'bg-brand-soft',
        )}
      >
        {done ? (
          <Animated.View style={checkStyle}>
            <Icon
              as={CircleCheck}
              size={62}
              strokeWidth={2}
              className="text-positive-soft-foreground"
            />
          </Animated.View>
        ) : (
          <Icon
            as={method === 'face' ? ScanFace : Fingerprint}
            size={66}
            strokeWidth={1.6}
            className="text-brand-soft-foreground"
          />
        )}

        {/* scan sweep line */}
        {scanning ? (
          <Animated.View
            pointerEvents="none"
            style={[{ position: 'absolute', left: 0, right: 0, height: 3 }, sweepStyle]}
            className="bg-brand"
          />
        ) : null}
      </View>
    </View>
  );
}
