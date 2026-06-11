import { ScreenStub } from "../../../components/drops/screen-stub";
import { buildRoute } from "../../../lib/routes";

export default function ImportSeedScreen() {
  return (
    <ScreenStub
      eyebrow="Import · Family seed"
      title="Enter your family seed"
      blurb="Your single s… secret. Restores the XRP Ledger only. We checksum it before continuing."
      design="onboarding/screens-input.jsx (Family seed entry)"
      links={[
        { label: "Restore wallet", href: buildRoute.onboardingSuccess("xrpl") },
      ]}
    />
  );
}
