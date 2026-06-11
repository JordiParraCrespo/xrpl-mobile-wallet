import { Stack } from 'expo-router';

/**
 * Dewy — the wallet assistant (chat.html). The sessions drawer lets the user
 * switch conversations, so each thread is its own route under `[session]`.
 */
export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[session]" />
    </Stack>
  );
}
