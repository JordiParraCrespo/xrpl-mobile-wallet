import { ScreenStub } from "../../../components/drops/screen-stub";
import { buildRoute } from "../../../lib/routes";

export default function BackupQuizScreen() {
  return (
    <ScreenStub
      eyebrow="Create · 3 of 3"
      title="Confirm your backup"
      blurb="Pick the correct words in order to confirm you've written your recovery phrase down."
      design="onboarding/screens-create.jsx (Backup quiz)"
      links={[
        { label: "Confirm", href: buildRoute.onboardingSuccess("phrase") },
      ]}
    />
  );
}
