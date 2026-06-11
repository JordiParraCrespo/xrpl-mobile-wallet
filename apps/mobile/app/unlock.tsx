import { ScreenStub } from '../components/drops/screen-stub';
import { Routes } from '../lib/routes';

/**
 * Passcode / Face ID gate for an initialized-but-locked vault. The security
 * module drives it: `useSecurityState().status === 'locked'`, `useUnlock()`
 * with the 6-digit passcode (PASSCODE_LENGTH), `useUnlockWithBiometrics()`,
 * and `useWipeWallet()` behind "Forgot your passcode?".
 */
export default function UnlockScreen() {
  return (
    <ScreenStub
      eyebrow="Locked"
      title="Unlock"
      blurb="6-dot passcode over the watercolor backdrop, glass keypad, Face ID key, and a forgot-passcode escape hatch that wipes the vault."
      design="unlock.html · unlock/unlock-app.jsx"
      showBack={false}
      links={[{ label: 'Unlock (stub)', href: Routes.Home, replace: true }]}
    />
  );
}
