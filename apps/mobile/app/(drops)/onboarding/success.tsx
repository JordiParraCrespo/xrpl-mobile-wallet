import { useLocalSearchParams } from 'expo-router';
import { ScreenStub } from '../../../components/drops/screen-stub';
import { Routes } from '../../../lib/routes';

export default function OnboardingSuccessScreen() {
  // `via=phrase` restores every chain (r… + 0x…); `via=xrpl` is XRP Ledger only (r…).
  const { via } = useLocalSearchParams<{ via?: string }>();
  const blurb =
    via === 'xrpl'
      ? 'Your XRP Ledger account is ready. We restored your r… address.'
      : 'Your wallet is ready. We restored your XRP Ledger (r…) and XRPL EVM (0x…) addresses.';

  return (
    <ScreenStub
      eyebrow="All set"
      title="Your wallet is ready"
      blurb={blurb}
      design="onboarding/screens-immersive.jsx (Success)"
      links={[{ label: 'Open wallet', href: Routes.Home, replace: true }]}
    />
  );
}
