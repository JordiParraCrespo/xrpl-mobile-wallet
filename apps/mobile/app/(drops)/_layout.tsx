import { Stack } from "expo-router";

/**
 * Drops wallet shell — routing skeleton for the full design.
 *
 * Top-level areas:
 *  - `onboarding/`  the pre-wallet flow (welcome → create | import → success)
 *  - `(tabs)/`      the signed-in hub: Home · Market · Payments · DropPoints (+ Dewy)
 *  - `flows/`       money actions presented as modals (add money · receive · swap · send)
 *  - `profile`      account & settings (reached from any header avatar)
 *  - `chat/`        the Dewy assistant (full screen, with session history)
 *
 * Money flows are modal so they sit above the hub and dismiss back to it,
 * matching the design's "temporary layer" language.
 */
export default function DropsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="chat" />
      <Stack.Screen
        name="flows/add-money"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="flows/receive" options={{ presentation: "modal" }} />
      <Stack.Screen name="flows/swap" options={{ presentation: "modal" }} />
      <Stack.Screen name="flows/send" options={{ presentation: "modal" }} />
    </Stack>
  );
}
