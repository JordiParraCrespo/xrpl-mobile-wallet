import { ScreenStub } from "../../../components/drops/screen-stub";
import { Routes } from "../../../lib/routes";

export default function WelcomeScreen() {
  return (
    <ScreenStub
      eyebrow="Welcome"
      title="Your XRPL, made simple."
      blurb="Hold, send and receive XRP and stablecoins in seconds. Self-custody that finally feels effortless."
      design="onboarding/index.html · screens-immersive.jsx (Welcome)"
      links={[
        { label: "Create a new wallet", href: Routes.OnboardingSecureIntro },
        {
          label: "I already have a wallet",
          href: Routes.OnboardingImport,
          variant: "secondary",
        },
      ]}
    />
  );
}
