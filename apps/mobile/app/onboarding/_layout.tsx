import { Stack } from 'expo-router';
import { CreateWalletProvider } from '../../components/auth/create-wallet';

/**
 * Onboarding — account entry. Twelve screens across two paths plus shared
 * success + notifications screens (see onboarding/README.md). Both paths run
 * through backup-info → set-passcode, where set-passcode initializes the vault
 * — nothing can be persisted before it:
 *
 *   welcome ─┬─ create ── secure-intro → backup-info → set-passcode → notifications → reveal-phrase → backup-quiz ─┐
 *            └─ import ── backup-info → set-passcode → notifications → import (picker) → phrase | seed | secret-numbers ─┤
 *                                                                                            └─→ success → home
 */
export default function OnboardingLayout() {
  return (
    <CreateWalletProvider>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="backup-info" />
        <Stack.Screen name="set-passcode" />
        <Stack.Screen name="secure-intro" />
        <Stack.Screen name="reveal-phrase" />
        <Stack.Screen name="backup-quiz" />
        <Stack.Screen name="import" />
        <Stack.Screen name="import-phrase" />
        <Stack.Screen name="import-seed" />
        <Stack.Screen name="import-secret-numbers" />
        <Stack.Screen name="success" />
        <Stack.Screen name="notifications" />
      </Stack>
    </CreateWalletProvider>
  );
}
