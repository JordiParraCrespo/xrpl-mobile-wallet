import { PasscodeKeypad } from '@flama/design-system-mobile/passcode-keypad';
import { Text } from '@flama/design-system-mobile/text';
import { AppError, PASSCODE_LENGTH, SecurityErrors } from '@flama/frontend';
import {
  useSecurityState,
  useUnlock,
  useUnlockWithBiometrics,
  useWipeWallet,
} from '@flama/frontend/react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PasscodeDots, type PasscodeDotsHandle } from '../components/drops/unlock/passcode-dots';
import { UnlockIdentity } from '../components/drops/unlock/unlock-identity';
import { UNLOCK_LIGHT } from '../components/drops/unlock/unlock-theme';
import { Routes } from '../lib/routes';

/**
 * Passcode / Face ID gate for an initialized-but-locked vault — the light
 * (watercolor) variant of `unlock.html · unlock/unlock-app.jsx`.
 *
 * Wired to the security module: the sixth digit submits to `useUnlock`
 * (wrong passcode shakes and surfaces the attempt/lockout state), the
 * biometric key appears once biometrics are enrolled, and the
 * forgot-passcode escape hatch wipes the vault back to onboarding.
 */
export default function UnlockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { biometricsAvailable, biometricsEnabled } = useSecurityState();
  const [pin, setPin] = React.useState('');
  const [errorKey, setErrorKey] = React.useState<
    'unlock.lockedOut' | 'unlock.wrongPasscode' | null
  >(null);
  const dotsRef = React.useRef<PasscodeDotsHandle>(null);

  const goHome = React.useCallback(() => router.replace(Routes.Home), [router]);

  const unlock = useUnlock({
    onSuccess: goHome,
    onError: (error) => {
      setErrorKey(
        error instanceof AppError && error.code === SecurityErrors.LOCKED_OUT.code
          ? 'unlock.lockedOut'
          : 'unlock.wrongPasscode',
      );
      dotsRef.current?.shake();
      setTimeout(() => setPin(''), 420);
    },
  });
  const { mutate: submitPasscode, isPending } = unlock;

  // A dismissed Face ID sheet is not an error worth shouting about — the
  // passcode pad is right there.
  const biometricUnlock = useUnlockWithBiometrics({ onSuccess: goHome });

  const wipe = useWipeWallet({
    onSuccess: () => router.replace(Routes.Root),
  });

  // Submit when the sixth digit lands. `errorKey` holds the gate shut while
  // the failure feedback (shake + message) is still playing out.
  React.useEffect(() => {
    if (pin.length !== PASSCODE_LENGTH || isPending || errorKey) return;
    submitPasscode(pin);
  }, [pin, isPending, errorKey, submitPasscode]);

  const press = React.useCallback(
    (digit: string) => {
      if (isPending || wipe.isPending) return;
      setErrorKey(null);
      setPin((prev) => (prev.length >= PASSCODE_LENGTH ? prev : prev + digit));
    },
    [isPending, wipe.isPending],
  );

  const back = React.useCallback(() => setPin((p) => p.slice(0, -1)), []);

  const confirmWipe = React.useCallback(() => {
    Alert.alert(t('unlock.wipeTitle'), t('unlock.wipeMessage'), [
      { text: t('unlock.wipeCancel'), style: 'cancel' },
      {
        text: t('unlock.wipeConfirm'),
        style: 'destructive',
        onPress: () => wipe.mutate(),
      },
    ]);
  }, [t, wipe.mutate]);

  const biometricsReady = biometricsAvailable && biometricsEnabled;

  return (
    <View className="flex-1 bg-[#3a1f5c]">
      <StatusBar style="light" />
      <ImageBackground
        source={require('../assets/unlock-watercolor.png')}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <View style={{ marginTop: 64 }}>
            <UnlockIdentity />
          </View>

          <View style={{ marginTop: 58 }}>
            <PasscodeDots ref={dotsRef} length={PASSCODE_LENGTH} filled={pin.length} />
          </View>

          {/* Failure feedback — fixed height so the layout never jumps. */}
          <View style={{ marginTop: 20, height: 20 }}>
            {errorKey ? (
              <Text
                className="font-sans font-semibold"
                style={{
                  fontSize: 13.5,
                  lineHeight: 19,
                  color: UNLOCK_LIGHT.fg,
                }}
              >
                {t(errorKey)}
              </Text>
            ) : null}
          </View>

          <View style={{ flex: 1 }} />

          <PasscodeKeypad
            onDigit={press}
            onBackspace={back}
            onBiometric={biometricsReady ? () => biometricUnlock.mutate() : undefined}
            backspaceDisabled={pin.length === 0}
            style={{ marginBottom: 14 }}
          />

          <Pressable
            className="active:opacity-70"
            style={{ marginTop: 18 }}
            disabled={wipe.isPending}
            onPress={confirmWipe}
          >
            <Text
              className="font-sans font-semibold"
              style={{ fontSize: 16, lineHeight: 22, color: UNLOCK_LIGHT.fg }}
            >
              {t('unlock.forgotPasscode')}
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}
