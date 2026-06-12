import type { LucideIcon } from "lucide-react-native";
import { Delete, ScanFace } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "../../lib/utils";
import { GlassBackdrop, type GlassBackdropProps } from "./glass-panel";
import { Icon } from "./icon";
import { Text } from "./text";

// PasscodeKeypad — the passcode entry pad for the lock screen. A 3-column
// grid of circular keys (1–9, a biometric key, 0, backspace) sized for an
// immersive surface: frosted-glass digit keys with white glyphs over the
// watercolor / gradient backdrop, plain transparent keys for biometrics and
// delete. Distinct from the amount Keypad (decimal entry on flow sheets).

const KEY = 66; // diameter of each key, per the Drops unlock spec
const COL_GAP = 38;
const ROW_GAP = 20;

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
    /** Icon for the biometric key. Defaults to Face ID (ScanFace). */
    biometricIcon?: LucideIcon;
  };

function DigitKey({
  value,
  onPress,
  intensity,
  tint,
  experimentalBlurMethod,
}: { value: string; onPress: (d: string) => void } & GlassBackdropProps) {
  return (
    <Pressable
      role="button"
      onPress={() => onPress(value)}
      style={{ width: KEY, height: KEY }}
      className="items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/[0.22] active:scale-[0.92] active:bg-white/30"
    >
      <GlassBackdrop
        intensity={intensity}
        tint={tint}
        experimentalBlurMethod={experimentalBlurMethod}
      />
      <Text
        className="font-sans text-[28px] leading-[34px] text-white"
        style={{ letterSpacing: 0.5 }}
      >
        {value}
      </Text>
    </Pressable>
  );
}

function PlainKey({
  onPress,
  disabled,
  dimmed,
  label,
  children,
}: {
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
      style={{ width: KEY, height: KEY, opacity: dimmed ? 0.45 : 1 }}
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
  biometricIcon = ScanFace,
  intensity,
  tint,
  experimentalBlurMethod,
  className,
  style,
  ...props
}: PasscodeKeypadProps) {
  const blur = { intensity, tint, experimentalBlurMethod };
  return (
    <View
      className={cn("flex-row flex-wrap justify-center", className)}
      style={[
        { width: KEY * 3 + COL_GAP * 2, columnGap: COL_GAP, rowGap: ROW_GAP },
        style,
      ]}
      {...props}
    >
      {LAYOUT.map((key) => {
        if (key === "biometric") {
          return (
            <PlainKey
              key="biometric"
              label="Unlock with biometrics"
              onPress={onBiometric}
              disabled={!onBiometric}
            >
              <Icon as={biometricIcon} size={30} className="text-white" />
            </PlainKey>
          );
        }
        if (key === "backspace") {
          return (
            <PlainKey
              key="backspace"
              label="Delete"
              onPress={onBackspace}
              disabled={backspaceDisabled}
              dimmed={backspaceDisabled}
            >
              <Icon as={Delete} size={28} className="text-white" />
            </PlainKey>
          );
        }
        return <DigitKey key={key} value={key} onPress={onDigit} {...blur} />;
      })}
    </View>
  );
}

export type { PasscodeKeypadProps };
export { PasscodeKeypad };
