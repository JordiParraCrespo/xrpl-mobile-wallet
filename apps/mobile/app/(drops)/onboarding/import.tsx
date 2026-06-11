import { ScreenStub } from '../../../components/drops/screen-stub';
import { Routes } from '../../../lib/routes';

export default function ImportPickerScreen() {
  return (
    <ScreenStub
      eyebrow="Import"
      title="How do you want to restore?"
      blurb="Recovery phrase restores every XRPL chain. A family seed or secret numbers restore the XRP Ledger only."
      design="onboarding/screens-input.jsx (Import method picker)"
      links={[
        { label: 'Recovery phrase', href: Routes.OnboardingImportPhrase },
        {
          label: 'Family seed',
          href: Routes.OnboardingImportSeed,
          variant: 'secondary',
        },
        {
          label: 'Secret numbers',
          href: Routes.OnboardingImportSecretNumbers,
          variant: 'secondary',
        },
      ]}
    />
  );
}
