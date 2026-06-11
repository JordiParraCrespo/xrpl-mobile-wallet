import { Text } from "@flama/design-system-mobile/text";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Routes } from "../../lib/routes";

/**
 * Passcode / Face ID gate for an initialized-but-locked vault — the light
 * (watercolor) variant of `unlock.html · unlock/unlock-app.jsx`.
 *
 * A 6-dot passcode over the watercolor backdrop, a frosted-glass keypad with a
 * Face ID key, and a "Forgot your passcode?" escape hatch. Wired with mock
 * data (account "JP · Jordi"): any 6 digits shake-and-reset like the prototype,
 * and the Face ID key unlocks straight to Home.
 */

const PIN_LEN = 6;

// Light theme tokens, lifted verbatim from UN_THEME.light in unlock-app.jsx.
const TH = {
  fg: "#fff",
  dotOn: "#fff",
  dotOff: "rgba(255,255,255,0.4)",
  keyBg: "rgba(255,255,255,0.22)",
  keyBorder: "rgba(255,255,255,0.4)",
  avBg: "rgba(255,255,255,0.92)",
  avFg: "#6a3fb0",
};

// Mock account behind the lock screen.
const ACCOUNT = { initials: "JP", name: "Jordi" };

function FaceIdIcon({
  size = 30,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M4 8V6a2 2 0 0 1 2-2h2" />
      <Path d="M16 4h2a2 2 0 0 1 2 2v2" />
      <Path d="M20 16v2a2 2 0 0 1-2 2h-2" />
      <Path d="M8 20H6a2 2 0 0 1-2-2v-2" />
      <Path d="M9 9v1" />
      <Path d="M15 9v1" />
      <Path d="M12 9v3l-1 1" />
      <Path d="M9 15a3.5 3.5 0 0 0 6 0" />
    </Svg>
  );
}

function BackspaceIcon({
  size = 28,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M21 5H8.5a2 2 0 0 0-1.6.8L2 12l4.9 6.2a2 2 0 0 0 1.6.8H21a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
      <Path d="m15 9-4 4" />
      <Path d="m11 9 4 4" />
    </Svg>
  );
}

type DigitKeyProps = { value: string; onPress: (d: string) => void };

function DigitKey({ value, onPress }: DigitKeyProps) {
  return (
    <Pressable
      onPress={() => onPress(value)}
      className="active:scale-[0.92]"
      style={styles.keyCircle}
    >
      <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: TH.keyBg, borderRadius: 33 },
        ]}
      />
      <Text className="font-sans" style={styles.keyDigit}>
        {value}
      </Text>
    </Pressable>
  );
}

type PlainKeyProps = {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  label: string;
};

function PlainKey({
  onPress,
  disabled,
  style,
  children,
  label,
}: PlainKeyProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      className="active:scale-[0.92]"
      style={[styles.keyPlain, style]}
    >
      {children}
    </Pressable>
  );
}

export default function UnlockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = React.useState("");
  const shake = React.useRef(new Animated.Value(0)).current;

  const runShake = React.useCallback(() => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, {
        toValue: -9,
        duration: 84,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 8,
        duration: 84,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: -6,
        duration: 84,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 4,
        duration: 84,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 84,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shake]);

  const press = React.useCallback(
    (d: string) => {
      setPin((prev) => {
        if (prev.length >= PIN_LEN) return prev;
        const next = prev + d;
        // Mock: a full passcode always rejects, shakes, and resets — exactly
        // like the prototype. Real wiring would verify via the security module.
        if (next.length === PIN_LEN) {
          setTimeout(() => {
            runShake();
            setTimeout(() => setPin(""), 420);
          }, 180);
        }
        return next;
      });
    },
    [runShake],
  );

  const back = React.useCallback(() => setPin((p) => p.slice(0, -1)), []);
  const unlock = React.useCallback(() => router.replace(Routes.Home), [router]);

  return (
    <View className="flex-1 bg-[#3a1f5c]">
      <StatusBar style="light" />
      <ImageBackground
        source={require("../../assets/unlock-watercolor.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 16,
          }}
        >
          {/* Identity */}
          <View style={{ alignItems: "center", marginTop: 64 }}>
            <View style={[styles.avatar, { backgroundColor: TH.avBg }]}>
              <Text
                className="font-sans font-bold"
                style={{ fontSize: 34, color: TH.avFg }}
              >
                {ACCOUNT.initials}
              </Text>
            </View>
            <Text
              className="font-sans font-bold"
              style={{
                fontSize: 27,
                color: TH.fg,
                marginTop: 22,
                letterSpacing: -0.2,
              }}
            >
              Welcome back, {ACCOUNT.name}
            </Text>
          </View>

          {/* Dots */}
          <Animated.View
            style={{
              flexDirection: "row",
              gap: 22,
              marginTop: 58,
              transform: [{ translateX: shake }],
            }}
          >
            {Array.from({ length: PIN_LEN }).map((_, i) => {
              const filled = i < pin.length;
              return (
                <View
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length dot row
                  key={i}
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: 17,
                    backgroundColor: filled ? TH.dotOn : TH.dotOff,
                    transform: [{ scale: filled ? 1 : 0.92 }],
                  }}
                />
              );
            })}
          </Animated.View>

          <View style={{ flex: 1 }} />

          {/* Keypad */}
          <View style={styles.keypad}>
            {["1", "2", "3"].map((k) => (
              <DigitKey key={k} value={k} onPress={press} />
            ))}
            {["4", "5", "6"].map((k) => (
              <DigitKey key={k} value={k} onPress={press} />
            ))}
            {["7", "8", "9"].map((k) => (
              <DigitKey key={k} value={k} onPress={press} />
            ))}
            <PlainKey label="Face ID" onPress={unlock}>
              <FaceIdIcon color={TH.fg} />
            </PlainKey>
            <DigitKey value="0" onPress={press} />
            <PlainKey
              label="Delete"
              onPress={back}
              disabled={pin.length === 0}
              style={{ opacity: pin.length ? 1 : 0.45 }}
            >
              <BackspaceIcon color={TH.fg} />
            </PlainKey>
          </View>

          {/* Forgot */}
          <Pressable className="active:opacity-70" style={{ marginTop: 18 }}>
            <Text
              className="font-sans font-semibold"
              style={{ fontSize: 16, color: TH.fg }}
            >
              Forgot your passcode?
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  keypad: {
    width: 66 * 3 + 38 * 2,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 38,
    rowGap: 20,
    marginBottom: 14,
  },
  keyCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: TH.keyBorder,
  },
  keyPlain: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
  },
  keyDigit: {
    fontSize: 28,
    color: TH.fg,
    letterSpacing: 0.5,
  },
});
