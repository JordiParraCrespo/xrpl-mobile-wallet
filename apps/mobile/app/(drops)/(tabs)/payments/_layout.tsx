import { Stack } from "expo-router";

/**
 * Payments — the people-and-activity hub. Four views (payments/README.md):
 *  - index            the list (people rail + recent activity)
 *  - add-recipient    save a new recipient
 *  - [contact]        the per-person payment chat (money bubbles)
 *  - transaction/[id] the full-screen transaction detail (modal)
 */
export default function PaymentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-recipient" />
      <Stack.Screen name="[contact]" />
      <Stack.Screen
        name="transaction/[id]"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
