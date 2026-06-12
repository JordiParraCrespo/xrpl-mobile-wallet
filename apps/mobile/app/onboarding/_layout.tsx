import { Stack } from 'expo-router';
import { CreateWalletProvider } from '../../components/auth/create-wallet';

/**
 * Onboarding — account entry. Both paths open with the name screen (the local
 * display name, saved to the device) and run through backup-info →
 * set-passcode, where set-passcode initializes the vault — nothing wallet-side
 * can be persisted before it:
 *
 *   welcome ─┬─ create ── name → secure-intro → backup-info → set-passcode → notifications → reveal-phrase → backup-quiz ─┐
 *            └─ import ── name → backup-info → set-passcode → notifications → import (picker) → phrase | seed | secret-numbers ─┤
 *                                                                                                  └─→ success → home
 */
export default function OnboardingLayout() {
  return (
    <CreateWalletProvider>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="name" />
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
