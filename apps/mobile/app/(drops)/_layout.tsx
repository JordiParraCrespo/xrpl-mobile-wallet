import { Stack } from "expo-router";

/**
 * Drops wallet shell — the single root presentation layer.
 *
 * This is the only navigator that sits above the tab bar, so EVERY screen that
 * must cover the tabs (full-screen pushes and modals alike) is declared here as
 * a sibling of `(tabs)`. Expo Router resolves an href against the nearest
 * navigator that owns it and walks up, so `router.push('/(drops)/flows/send')`
 * from inside a tab presents on THIS stack and covers the tab bar automatically.
 *
 * Presentation hierarchy (bottom → top):
 *   onboarding ─ pre-wallet, shown before the hub
 *   (tabs) ───── the hub (owns the tab bar)
 *   pushes ───── profile · chat · payment/[contact]   (full screen, with back)
 *   modals ───── flows/* · add-recipient · transaction/[id]  (slide up, dismiss)
 *
 * Modals stack on top of pushes, and modal-over-modal works (e.g. open Send
 * from a payment chat), because they all share this one root stack.
 */
export default function DropsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />

      {/* Full-screen pushes — cover the tab bar, keep a back gesture. */}
      <Stack.Screen name="profile" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="payment/[contact]" />

      {/* Modals — slide up over everything, including the tab bar. */}
      <Stack.Screen
        name="flows/add-money"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="flows/receive" options={{ presentation: "modal" }} />
      <Stack.Screen name="flows/swap" options={{ presentation: "modal" }} />
      <Stack.Screen name="flows/send" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-recipient" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="transaction/[id]"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
