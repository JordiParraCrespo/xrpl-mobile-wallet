import { ScreenStub } from "../../../components/drops/screen-stub";

export default function SecureIntroScreen() {
  return (
    <ScreenStub
      eyebrow="Create · 1 of 3"
      title="Let's secure your wallet"
      blurb="Next you'll see your recovery phrase. Keep it private, we never store it, and you're responsible for backing it up."
      design="onboarding/screens-create.jsx (Secure intro)"
      links={[{ label: "Continue", href: "/(drops)/onboarding/reveal-phrase" }]}
    />
  );
}
