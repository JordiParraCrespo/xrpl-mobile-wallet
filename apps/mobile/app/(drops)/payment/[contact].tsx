import { useLocalSearchParams } from "expo-router";
import { ScreenStub } from "../../../components/drops/screen-stub";

export default function PaymentChatScreen() {
  const { contact } = useLocalSearchParams<{ contact: string }>();

  return (
    <ScreenStub
      eyebrow={`@${contact ?? "recipient"}`}
      title="Payment chat"
      blurb="Money bubbles — received (left) and sent (right) — with date separators and a composer (Split · Request · Send). Tap a bubble for the transaction detail."
      design="payments/payments-screens.jsx (Payment chat)"
      links={[
        { label: "Send money", href: "/(drops)/flows/send" },
        {
          label: "Open a transaction",
          href: {
            pathname: "/(drops)/transaction/[id]",
            params: { id: "tx_demo" },
          },
          variant: "secondary",
        },
      ]}
    />
  );
}
