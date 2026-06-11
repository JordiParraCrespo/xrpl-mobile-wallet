import { ScreenStub } from "../../../components/drops/screen-stub";
import { Routes } from "../../../lib/routes";

export default function RevealPhraseScreen() {
  return (
    <ScreenStub
      eyebrow="Create · 2 of 3"
      title="Your recovery phrase"
      blurb="Write these words down in order and keep them somewhere safe. Tap to reveal. Never share them with anyone."
      design="onboarding/screens-create.jsx (Reveal recovery phrase)"
      links={[{ label: "I've saved it", href: Routes.OnboardingBackupQuiz }]}
    />
  );
}
