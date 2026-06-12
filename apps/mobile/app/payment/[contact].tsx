import { Text } from '@flama/design-system-mobile/text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';
import { LightWashBackground } from '../../components/drops/light-wash-background';
import {
  getContact,
  PAYMENT_THREAD,
  PaymentBubble,
  PaymentChatHeader,
  PaymentComposer,
} from '../../components/drops/payments';
import { buildRoute, Routes } from '../../lib/routes';

/**
 * Payment chat — a money conversation with one contact (design: `payments.html`
 * · `payments/payments-screens.jsx` Chat). Over the light gradient wash: a
 * header with the contact's name + XRPL handle, a thread of date separators and
 * money bubbles (received left, sent right), and the Split · Request · Send
 * composer. Tapping a bubble opens its transaction detail.
 *
 * Mocked: the thread comes from `PAYMENT_THREAD`; nothing touches the wallet
 * domain yet. A full-screen push, so it covers the tab bar.
 */
export default function PaymentChatScreen() {
  const router = useRouter();
  const { contact } = useLocalSearchParams<{ contact: string }>();
  const { slug, name, handle } = getContact(contact);

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <LightWashBackground />

      <PaymentChatHeader name={name} handle={handle} onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4 pb-2 pt-1.5"
      >
        {PAYMENT_THREAD.map((entry) =>
          entry.type === 'date' ? (
            <Text
              key={`date-${entry.label}`}
              className="text-muted-foreground my-1.5 text-center text-[12.5px]"
            >
              {entry.label}
            </Text>
          ) : (
            <PaymentBubble
              key={entry.tx.id}
              tx={entry.tx}
              onPress={() => router.push(buildRoute.transaction(entry.tx.id, slug))}
            />
          ),
        )}
      </ScrollView>

      <PaymentComposer
        onSplit={() => router.push(Routes.Swap)}
        onRequest={() => router.push(Routes.Receive)}
        onSend={() => router.push(Routes.Send)}
      />
    </View>
  );
}
