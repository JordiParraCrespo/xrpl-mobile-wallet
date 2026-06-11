import { ScreenStub } from '../../components/drops/screen-stub';
import { buildRoute, Routes } from '../../lib/routes';

export default function PaymentsListScreen() {
  return (
    <ScreenStub
      eyebrow="Payments"
      title="People & activity"
      blurb="Quick-action chips, a scrolling people rail and the recent transaction list. Tap a person to open their payment chat."
      design="payments.html · payments/payments-app.jsx"
      showBack={false}
      links={[
        // Sub-screens live at the root so they cover the tab bar (full screen).
        { label: 'Add recipient', href: Routes.AddRecipient },
        {
          label: 'Open chat with Maria',
          href: buildRoute.paymentChat('maria'),
          variant: 'secondary',
        },
        { label: 'Profile', href: Routes.Profile, variant: 'outline' },
      ]}
    />
  );
}
