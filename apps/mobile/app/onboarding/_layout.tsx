import { Stack } from 'expo-router';
import { CreateWalletProvider } from '../../components/auth/create-wallet';

/**
 * Onboarding — account entry, organized in four themed blocks so related
 * screens always follow each other: who you are (name), secure this device
 * (backup-info explains the passcode → set-passcode initializes the vault →
 * biometrics enrolls Face ID / fingerprint on the fresh vault, auto-skipped
 * without hardware), your wallet keys (create: secure-intro → reveal →
 * verify; import: picker → method), then celebrate and the one app-level
 * extra (success → notifications):
 *
 *   welcome ─┬─ create ── name → backup-info → set-passcode → biometrics → secure-intro → reveal-phrase → backup-quiz ─┐
 *            └─ import ── name → backup-info → set-passcode → biometrics → import (picker) → phrase | seed | secret-numbers ─┤
 *                                                                                  └─→ success → notifications → home
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
        <Stack.Screen name="biometrics" />
        <Stack.Screen name="notifications" />
      </Stack>
    </CreateWalletProvider>
  );
}
