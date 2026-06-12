import type { LucideIcon } from "lucide-react-native";
import { ChevronLeft, Delete, ScanFace } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { GlassBackdrop, type GlassBackdropProps } from "./glass-panel";
import { Icon } from "./icon";
import { Text } from "./text";

// PasscodeKeypad — the passcode entry pad, themed per surface:
// `glass` (the unlock gate): frosted-glass digit keys with white glyphs over
// the watercolor / gradient backdrop; `light` (onboarding set-passcode):
// white hairline-bordered keys on the page surface. A 3-column grid of
// circular keys (1–9, an optional biometric key, 0, backspace); the
// bottom-left slot stays empty when no biometric handler is given.
// Distinct from the amount Keypad (decimal entry on flow sheets).

type Variant = "glass" | "light";

const METRICS: Record<
  Variant,
  { key: number; colGap: number; rowGap: number }
> = {
  glass: { key: 66, colGap: 38, rowGap: 20 },
  light: { key: 72, colGap: 36, rowGap: 16 },
};

type SpecialKey = "biometric" | "backspace";
const LAYOUT: (string | SpecialKey)[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "biometric",
  "0",
  "backspace",
];

type PasscodeKeypadProps = Omit<React.ComponentProps<typeof View>, "children"> &
  GlassBackdropProps & {
    /** A digit "0"–"9" was pressed. */
    onDigit: (digit: string) => void;
    /** The backspace key was pressed. */
    onBackspace: () => void;
    /** The biometric key was pressed. Omit to render the slot empty. */
    onBiometric?: () => void;
    /** Dim and disable the backspace key (e.g. when the passcode is empty). */
    backspaceDisabled?: boolean;
    /** Ignore all presses (mid-commit, error shake, success hand-off). */
    disabled?: boolean;
    /** Icon for the biometric key. Defaults to Face ID (ScanFace). */
    biometricIcon?: LucideIcon;
    /** Surface theme. Defaults to the unlock gate's glass keys. */
    variant?: Variant;
  };

function DigitKey({
  value,
  variant,
  onPress,
  disabled,
  intensity,
  tint,
  experimentalBlurMethod,
}: {
  value: string;
  variant: Variant;
  onPress: (d: string) => void;
  disabled: boolean;
} & GlassBackdropProps) {
  const size = METRICS[variant].key;
  return (
    <Pressable
      role="button"
      onPress={() => onPress(value)}
      disabled={disabled}
      style={{ width: size, height: size }}
      className={cn(
        "items-center justify-center overflow-hidden rounded-full",
        variant === "glass"
          ? "border border-white/40 bg-white/[0.22] active:scale-[0.92] active:bg-white/30"
          : "border-hairline border-border bg-card active:scale-[0.94] active:bg-secondary",
      )}
    >
      {variant === "glass" ? (
        <GlassBackdrop
          intensity={intensity}
          tint={tint}
          experimentalBlurMethod={experimentalBlurMethod}
        />
      ) : null}
      <Text
        className={cn(
          "font-sans",
          variant === "glass"
            ? "text-[28px] leading-[34px] text-white"
            : "text-[27px] font-medium leading-[33px] text-foreground",
        )}
        style={{ letterSpacing: 0.5 }}
      >
        {value}
      </Text>
    </Pressable>
  );
}

function PlainKey({
  size,
  onPress,
  disabled,
  dimmed,
  label,
  children,
}: {
  size: number;
  onPress?: () => void;
  disabled?: boolean;
  dimmed?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={{ width: size, height: size, opacity: dimmed ? 0.45 : 1 }}
      className="items-center justify-center rounded-full active:scale-[0.92]"
    >
      {children}
    </Pressable>
  );
}

function PasscodeKeypad({
  onDigit,
  onBackspace,
  onBiometric,
  backspaceDisabled = false,
  disabled = false,
  biometricIcon = ScanFace,
  variant = "glass",
  intensity,
  tint,
  experimentalBlurMethod,
  className,
  style,
  ...props
}: PasscodeKeypadProps) {
  const blur = { intensity, tint, experimentalBlurMethod };
  const { key: keySize, colGap, rowGap } = METRICS[variant];
  const iconColor = variant === "glass" ? "text-white" : "text-foreground";
  const BackspaceIcon = variant === "glass" ? Delete : ChevronLeft;

  return (
    <View
      className={cn("flex-row flex-wrap justify-center", className)}
      style={[
        { width: keySize * 3 + colGap * 2, columnGap: colGap, rowGap },
        style,
      ]}
      {...props}
    >
      {LAYOUT.map((key) => {
        if (key === "biometric") {
          // No handler → an empty slot, not a dead icon.
          if (!onBiometric) {
            return (
              <View
                key="biometric"
                style={{ width: keySize, height: keySize }}
              />
            );
          }
          return (
            <PlainKey
              key="biometric"
              size={keySize}
              label="Unlock with biometrics"
              onPress={onBiometric}
              disabled={disabled}
            >
              <Icon as={biometricIcon} size={30} className={iconColor} />
            </PlainKey>
          );
        }
        if (key === "backspace") {
          return (
            <PlainKey
              key="backspace"
              size={keySize}
              label="Delete"
              onPress={onBackspace}
              disabled={disabled || backspaceDisabled}
              dimmed={backspaceDisabled}
            >
              <Icon
                as={BackspaceIcon}
                size={variant === "glass" ? 28 : 26}
                className={iconColor}
              />
            </PlainKey>
          );
        }
        return (
          <DigitKey
            key={key}
            value={key}
            variant={variant}
            onPress={onDigit}
            disabled={disabled}
            {...blur}
          />
        );
      })}
    </View>
  );
}

export type { PasscodeKeypadProps };
export { PasscodeKeypad };
