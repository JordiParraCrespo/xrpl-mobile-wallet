import { Button } from '@flama/design-system-mobile/button';
import { Icon } from '@flama/design-system-mobile/icon';
import { ScreenHeader } from '@flama/design-system-mobile/screen-header';
import { Text } from '@flama/design-system-mobile/text';
import { useEnableBiometrics, useSecurityState } from '@flama/frontend/react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Fingerprint,
  Lock,
  type LucideIcon,
  ScanFace,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BiometricScanTarget, type ScanState } from '../../components/auth/biometric-scan-target';
import { type BiometricMethod, getBiometricModalities } from '../../lib/biometrics';
import { buildRoute, type OnboardingPath } from '../../lib/routes';

const BENEFITS: { key: 'instant' | 'approve' | 'enclave'; icon: LucideIcon }[] = [
  { key: 'instant', icon: Zap },
  { key: 'approve', icon: ShieldCheck },
  { key: 'enclave', icon: Lock },
];

/**
 * Biometric enrollment — sits between the passcode and the notifications ask,
 * while the vault is freshly unlocked (enrolling needs an unlocked keyring).
 * Enabling runs the real OS prompt through the security domain
 * (`security.enableBiometrics`) and only flips to the success state once the
 * device actually authorizes. Devices without enrolled biometrics skip the
 * screen entirely. "Not now" is always an equal exit. Design:
 * onboarding-biometrics.html.
 */
export default function BiometricsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { next } = useLocalSearchParams<{ next?: OnboardingPath }>();
  const { biometricsAvailable, biometricsEnabled } = useSecurityState();

  const [method, setMethod] = React.useState<BiometricMethod>('face');
  const [canSwitch, setCanSwitch] = React.useState(false);
  const [phase, setPhase] = React.useState<ScanState>('idle');
  const [failed, setFailed] = React.useState(false);

  // Label the screen for the modality the device actually has; only offer the
  // switch when both are present (a Face-ID-only phone shouldn't promise touch).
  React.useEffect(() => {
    let active = true;
    getBiometricModalities().then((m) => {
      if (!active) return;
      setMethod(m.method);
      setCanSwitch(m.canSwitch);
    });
    return () => {
      active = false;
    };
  }, []);

  const path: OnboardingPath = next === 'import' ? 'import' : 'create';
  const goNext = () => router.replace(buildRoute.onboardingNotifications(path));

  const enableBiometrics = useEnableBiometrics();
  const enable = () => {
    if (phase !== 'idle') return;
    setFailed(false);
    setPhase('scanning');
    enableBiometrics.mutate(undefined, {
      onSuccess: () => setPhase('done'),
      // A dismissed OS sheet or failed match isn't fatal — let them retry or skip.
      onError: () => {
        setPhase('idle');
        setFailed(true);
      },
    });
  };

  // No usable biometric hardware (or it's already enrolled) — nothing to ask.
  // Carry the path through so the notifications step still routes correctly.
  if (!biometricsAvailable || biometricsEnabled) {
    return <Redirect href={buildRoute.onboardingNotifications(path)} />;
  }

  const isFace = method === 'face';
  const methodLabel = t(`onboarding.biometrics.method.${method}`);
  const done = phase === 'done';
  const scanning = phase === 'scanning';

  const title = done
    ? t('onboarding.biometrics.doneTitle', { method: methodLabel })
    : t('onboarding.biometrics.title', { method: methodLabel });
  const subtitle = done
    ? t('onboarding.biometrics.doneSubtitle')
    : scanning
      ? t(`onboarding.biometrics.scanning.${method}`)
      : t('onboarding.biometrics.subtitle', { method: methodLabel });

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 8 }} className="px-6">
        <ScreenHeader step={3} total={3} onBack={scanning ? undefined : goNext} />
      </View>

      {/* hero target + heading */}
      <View className="items-center px-6 pt-2">
        <BiometricScanTarget method={method} state={phase} />
        <Text className="mt-[18px] text-center font-display text-[28px] leading-[32px] tracking-[-0.5px] text-foreground">
          {title}
        </Text>
        <View className="min-h-[44px]">
          <Text className="mt-2.5 max-w-[290px] text-center text-[15px] leading-[22px] text-muted-foreground">
            {subtitle}
          </Text>
        </View>
      </View>

      {/* benefits */}
      <View className="flex-1 justify-center px-7">
        <View style={{ opacity: done ? 0.45 : 1 }}>
          {BENEFITS.map((b) => (
            <View key={b.key} className="flex-row items-center gap-3.5 py-3">
              <View className="h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-brand-soft">
                <Icon as={b.icon} size={19} className="text-brand-soft-foreground" />
              </View>
              <Text className="min-w-0 flex-1 text-[14.5px] leading-5 text-foreground/80">
                {t(`onboarding.biometrics.benefits.${b.key}`, {
                  method: methodLabel,
                })}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* actions */}
      <View className="gap-3 px-6 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
        {done ? (
          <Button variant="brand" size="lg" className="w-full" onPress={goNext}>
            <Text>{t('onboarding.biometrics.continue')}</Text>
          </Button>
        ) : (
          <>
            <Button
              variant="brand"
              size="lg"
              className="w-full"
              disabled={scanning}
              onPress={enable}
            >
              <View className="flex-row items-center gap-2.5">
                <Icon
                  as={isFace ? ScanFace : Fingerprint}
                  size={20}
                  className="text-brand-foreground"
                />
                <Text>
                  {scanning
                    ? t('onboarding.biometrics.enabling', {
                        method: methodLabel,
                      })
                    : t('onboarding.biometrics.enable', {
                        method: methodLabel,
                      })}
                </Text>
              </View>
            </Button>

            <View className="min-h-[20px] items-center">
              {failed ? (
                <Text className="text-[13.5px] font-semibold text-destructive">
                  {t('onboarding.biometrics.error', { method: methodLabel })}
                </Text>
              ) : canSwitch ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={scanning}
                  onPress={() => setMethod(isFace ? 'touch' : 'face')}
                >
                  <View className="flex-row items-center gap-2">
                    <Icon as={isFace ? Fingerprint : ScanFace} size={17} className="text-brand" />
                    <Text className="text-brand">
                      {t('onboarding.biometrics.switch', {
                        method: t(`onboarding.biometrics.method.${isFace ? 'touch' : 'face'}`),
                      })}
                    </Text>
                  </View>
                </Button>
              ) : null}
            </View>

            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              disabled={scanning}
              onPress={goNext}
            >
              <Text className="text-muted-foreground">{t('onboarding.biometrics.skip')}</Text>
            </Button>
          </>
        )}
      </View>
    </View>
  );
}
