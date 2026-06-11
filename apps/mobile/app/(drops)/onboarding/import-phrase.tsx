import { ScreenStub } from '../../../components/drops/screen-stub';
import { buildRoute } from '../../../lib/routes';

export default function ImportPhraseScreen() {
  return (
    <ScreenStub
      eyebrow="Import · Recovery phrase"
      title="Enter your recovery phrase"
      blurb="Type or paste your 12 or 24 words. We validate each word against the wordlist as you go."
      design="onboarding/screens-input.jsx (Recovery phrase entry)"
      links={[
        {
          label: 'Restore wallet',
          href: buildRoute.onboardingSuccess('phrase'),
        },
      ]}
    />
  );
}
