import { ScreenStub } from "../../../components/drops/screen-stub";
import { Routes } from "../../../lib/routes";

export default function SecureIntroScreen() {
  return (
    <ScreenStub
      eyebrow="Create · 1 of 3"
      title="Let's secure your wallet"
      blurb="Next you'll see your recovery phrase. Keep it private, we never store it, and you're responsible for backing it up."
      design="onboarding/screens-create.jsx (Secure intro)"
      links={[{ label: "Continue", href: Routes.OnboardingRevealPhrase }]}
    />
  );
}
