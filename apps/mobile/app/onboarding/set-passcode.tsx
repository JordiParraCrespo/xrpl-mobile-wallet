import { Icon } from '@flama/design-system-mobile/icon';
import { PasscodeDots } from '@flama/design-system-mobile/passcode-dots';
import { PasscodeKeypad } from '@flama/design-system-mobile/passcode-keypad';
import { ScreenHeader } from '@flama/design-system-mobile/screen-header';
import { Text } from '@flama/design-system-mobile/text';
import { cn } from '@flama/design-system-mobile/utils';
import { PASSCODE_LENGTH } from '@flama/frontend';
import { useSecurityState, useSetupPasscode } from '@flama/frontend/react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { CircleCheck, Lock } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buildRoute, type OnboardingPath, Routes } from '../../lib/routes';

/** How long the mismatch state shows before the flow resets to "create". */
const ERROR_RESET_MS = 640;
/** How long "Passcode set" shows before handing off to the next screen. */
const DONE_HOLD_MS = 520;
/** Brief pause after the sixth digit so the last dot is seen filling. */
const COMMIT_PAUSE_MS = 200;

/**
 * Creates the vault passcode — the step that actually initializes the
 * encrypted keyring (`security.setupPasscode` → `keyring.initialize`). Both
 * onboarding paths pass through here before anything can be persisted:
 * create (before revealing the phrase) and import (before the method picker).
 * The `next` param picks the destination. Design: onboarding-passcode.html.
 */
export default function SetPasscodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { next } = useLocalSearchParams<{ next?: OnboardingPath }>();
  const { status } = useSecurityState();

  const isImport = next === 'import';
  // Where the flow resumes when the vault already exists (re-entry skip):
  // the keys block that follows the device-security block.
  const destination = isImport ? Routes.OnboardingImport : Routes.OnboardingSecureIntro;

  const [phase, setPhase] = React.useState<'create' | 'confirm'>('create');
  const [first, setFirst] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState<'mismatch' | 'setup' | null>(null);
  const [done, setDone] = React.useState(false);

  const confirming = phase === 'confirm';

  const setup = useSetupPasscode({
    onSuccess: () => setDone(true),
    onError: () => setError('setup'),
  });
  const { mutate: setupPasscode, isPending, isIdle } = setup;

  // Commit when a full code is entered: create → confirm, then verify and
  // persist. Error recovery lives in its own effect below so toggling `error`
  // can't cancel its own reset timer (a bug the prototype hit and fixed).
  React.useEffect(() => {
    if (code.length !== PASSCODE_LENGTH || done || error || isPending) return;
    if (!confirming) {
      const timer = setTimeout(() => {
        setFirst(code);
        setCode('');
        setPhase('confirm');
      }, COMMIT_PAUSE_MS);
      return () => clearTimeout(timer);
    }
    if (code === first) {
      setupPasscode(code);
      return;
    }
    setError('mismatch');
  }, [code, confirming, first, done, error, isPending, setupPasscode]);

  // Mismatch / failure: shake, show the message briefly, reset to "create".
  React.useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError(null);
      setCode('');
      setFirst('');
      setPhase('create');
    }, ERROR_RESET_MS);
    return () => clearTimeout(timer);
  }, [error]);

  // Success: hold the "Passcode set" state a beat, then on to the biometric
  // enrollment ask (skipped automatically when no biometrics are enrolled),
  // which continues into this path's next step.
  React.useEffect(() => {
    if (!done) return;
    const timer = setTimeout(
      () => router.replace(buildRoute.onboardingBiometrics(isImport ? 'import' : 'create')),
      DONE_HOLD_MS,
    );
    return () => clearTimeout(timer);
  }, [done, isImport, router]);

  // The vault already existed on arrival (the user backed out of a later step
  // and came through here again) — nothing to set up (and they've already had
  // the notifications ask), continue straight to the flow.
  if (status === 'unlocked' && isIdle) {
    return <Redirect href={destination} />;
  }

  const locked = done || error !== null || isPending;

  const pressKey = (digit: string) => {
    if (locked) return;
    setCode((value) => (value.length >= PASSCODE_LENGTH ? value : value + digit));
  };
  const pressBackspace = () => {
    if (locked) return;
    setCode((value) => value.slice(0, -1));
  };
  const resetToCreate = () => {
    setPhase('create');
    setCode('');
    setFirst('');
  };

  const title = done
    ? t('onboarding.setPasscode.doneTitle')
    : confirming
      ? t('onboarding.setPasscode.confirmTitle')
      : t('onboarding.setPasscode.title');
  const subtitle = done
    ? t('onboarding.setPasscode.doneSubtitle')
    : confirming
      ? t('onboarding.setPasscode.confirmSubtitle')
      : t('onboarding.setPasscode.subtitle');

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 8 }} className="px-6">
        <ScreenHeader
          step={2}
          total={isImport ? 4 : 5}
          onBack={confirming && !locked ? resetToCreate : () => router.back()}
        />
      </View>

      {/* Heading — tinted lock disc that flips positive once the vault is set. */}
      <View className="items-center px-6 pt-3">
        <View
          className={cn(
            'h-[58px] w-[58px] items-center justify-center rounded-[18px]',
            done ? 'bg-positive-soft' : 'bg-brand-soft',
          )}
        >
          <Icon
            as={done ? CircleCheck : Lock}
            size={28}
            className={done ? 'text-positive-soft-foreground' : 'text-brand-soft-foreground'}
          />
        </View>
        <Text className="mt-5 text-center font-display text-[28px] leading-[32px] tracking-[-0.5px] text-foreground">
          {title}
        </Text>
        <Text className="mt-2.5 max-w-[280px] text-center text-[15px] leading-6 text-muted-foreground">
          {subtitle}
        </Text>
      </View>

      {/* Dots + transient error line */}
      <View className="flex-1 items-center justify-center gap-[22px] px-6">
        <PasscodeDots length={PASSCODE_LENGTH} filled={code.length} error={error !== null} />
        <View className="h-[18px]">
          {error ? (
            <Text className="text-[13.5px] font-semibold text-destructive">
              {error === 'setup'
                ? t('onboarding.setPasscode.error')
                : t('onboarding.setPasscode.mismatch')}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
        <PasscodeKeypad
          variant="light"
          onDigit={pressKey}
          onBackspace={pressBackspace}
          disabled={locked}
        />
      </View>
    </View>
  );
}
