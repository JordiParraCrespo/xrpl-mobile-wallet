import { PasscodeKeypad } from "@flama/design-system-mobile/passcode-keypad";
import { Text } from "@flama/design-system-mobile/text";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PasscodeDots,
  type PasscodeDotsHandle,
} from "../../components/drops/unlock/passcode-dots";
import { UnlockIdentity } from "../../components/drops/unlock/unlock-identity";
import { UNLOCK_LIGHT } from "../../components/drops/unlock/unlock-theme";
import { Routes } from "../../lib/routes";

/**
 * Passcode / Face ID gate for an initialized-but-locked vault — the light
 * (watercolor) variant of `unlock.html · unlock/unlock-app.jsx`.
 *
 * This screen is the orchestrator: it owns the passcode state and lays out the
 * pieces it composes — `UnlockIdentity`, `PasscodeDots`, the design-system
 * `PasscodeKeypad`, and the forgot-passcode escape hatch — over the watercolor
 * backdrop. Wired with mock data: any 6 digits shake-and-reset like the
 * prototype, and the Face ID key unlocks straight to Home.
 */
const PIN_LEN = 6;

export default function UnlockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = React.useState("");
  const dotsRef = React.useRef<PasscodeDotsHandle>(null);

  const press = React.useCallback((d: string) => {
    setPin((prev) => {
      if (prev.length >= PIN_LEN) return prev;
      const next = prev + d;
      // Mock: a full passcode always rejects, shakes, and resets — exactly
      // like the prototype. Real wiring would verify via the security module.
      if (next.length === PIN_LEN) {
        setTimeout(() => {
          dotsRef.current?.shake();
          setTimeout(() => setPin(""), 420);
        }, 180);
      }
      return next;
    });
  }, []);

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
          <View style={{ marginTop: 64 }}>
            <UnlockIdentity />
          </View>

          <View style={{ marginTop: 58 }}>
            <PasscodeDots ref={dotsRef} length={PIN_LEN} filled={pin.length} />
          </View>

          <View style={{ flex: 1 }} />

          <PasscodeKeypad
            onDigit={press}
            onBackspace={back}
            onBiometric={unlock}
            backspaceDisabled={pin.length === 0}
            style={{ marginBottom: 14 }}
          />

          <Pressable className="active:opacity-70" style={{ marginTop: 18 }}>
            <Text
              className="font-sans font-semibold"
              style={{ fontSize: 16, color: UNLOCK_LIGHT.fg }}
            >
              Forgot your passcode?
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}
