import { Stack } from "expo-router";
import { CreateWalletProvider } from "../../../components/drops/create-wallet";

/**
 * Onboarding — account entry. Nine screens across two paths plus a shared
 * success screen (see onboarding/README.md):
 *
 *   welcome ─┬─ create ── secure-intro → reveal-phrase → backup-quiz ─┐
 *            └─ import ── import (picker) → phrase | seed | secret-numbers ─┤
 *                                                                          └─→ success → home
 */
export default function OnboardingLayout() {
  return (
    <CreateWalletProvider>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="secure-intro" />
        <Stack.Screen name="reveal-phrase" />
        <Stack.Screen name="backup-quiz" />
        <Stack.Screen name="import" />
        <Stack.Screen name="import-phrase" />
        <Stack.Screen name="import-seed" />
        <Stack.Screen name="import-secret-numbers" />
        <Stack.Screen name="success" />
      </Stack>
    </CreateWalletProvider>
  );
}
