import { useLocalSearchParams } from 'expo-router';
import { ScreenStub } from '../../components/drops/screen-stub';
import { DEMO_RECIPIENT } from '../../components/drops/send';
import { buildRoute } from '../../lib/routes';

export default function PaymentChatScreen() {
  const { contact } = useLocalSearchParams<{ contact: string }>();

  return (
    <ScreenStub
      eyebrow={`@${contact ?? 'recipient'}`}
      title="Payment chat"
      blurb="Money bubbles — received (left) and sent (right) — with date separators and a composer (Split · Request · Send). Tap a bubble for the transaction detail."
      design="payments/payments-screens.jsx (Payment chat)"
      links={[
        {
          label: 'Send money',
          // Seed the flow with this thread's recipient. The address is a demo
          // peer for now (the chat stub has no real contact directory yet).
          href: buildRoute.send({
            name: DEMO_RECIPIENT.name,
            handle: contact ? `@${contact}` : (DEMO_RECIPIENT.handle ?? undefined),
            address: DEMO_RECIPIENT.address ?? undefined,
          }),
        },
        {
          label: 'Open a transaction',
          href: buildRoute.transaction('tx_demo'),
          variant: 'secondary',
        },
      ]}
    />
  );
}
