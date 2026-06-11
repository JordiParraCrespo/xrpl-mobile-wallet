import { ScreenStub } from '../../../components/drops/screen-stub';
import { buildRoute } from '../../../lib/routes';

export default function ImportSecretNumbersScreen() {
  return (
    <ScreenStub
      eyebrow="Import · Secret numbers"
      title="Enter your secret numbers"
      blurb="The Xaman eight-row number grid. Each row is validated with its own checksum. Restores the XRP Ledger only."
      design="onboarding/screens-input.jsx (Secret numbers entry)"
      links={[{ label: 'Restore wallet', href: buildRoute.onboardingSuccess('xrpl') }]}
    />
  );
}
