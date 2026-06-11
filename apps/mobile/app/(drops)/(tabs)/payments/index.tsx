import { ScreenStub } from "../../../../components/drops/screen-stub";

export default function PaymentsListScreen() {
  return (
    <ScreenStub
      eyebrow="Payments"
      title="People & activity"
      blurb="Quick-action chips, a scrolling people rail and the recent transaction list. Tap a person to open their payment chat."
      design="payments.html · payments/payments-app.jsx"
      showBack={false}
      links={[
        {
          label: "Add recipient",
          href: "/(drops)/(tabs)/payments/add-recipient",
        },
        {
          label: "Open chat with Maria",
          href: {
            pathname: "/(drops)/(tabs)/payments/[contact]",
            params: { contact: "maria" },
          },
          variant: "secondary",
        },
        { label: "Profile", href: "/(drops)/profile", variant: "outline" },
      ]}
    />
  );
}
