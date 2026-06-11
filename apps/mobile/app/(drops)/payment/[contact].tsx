import { useLocalSearchParams } from "expo-router";
import { ScreenStub } from "../../../components/drops/screen-stub";
import { buildRoute, Routes } from "../../../lib/routes";

export default function PaymentChatScreen() {
  const { contact } = useLocalSearchParams<{ contact: string }>();

  return (
    <ScreenStub
      eyebrow={`@${contact ?? "recipient"}`}
      title="Payment chat"
      blurb="Money bubbles — received (left) and sent (right) — with date separators and a composer (Split · Request · Send). Tap a bubble for the transaction detail."
      design="payments/payments-screens.jsx (Payment chat)"
      links={[
        { label: "Send money", href: Routes.Send },
        {
          label: "Open a transaction",
          href: buildRoute.transaction("tx_demo"),
          variant: "secondary",
        },
      ]}
    />
  );
}
