import type { IBiometricProvider } from '@flama/frontend';
import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Face ID / fingerprint via expo-local-authentication, injected into the
 * security module for biometric vault unlock.
 */
export class ExpoBiometricProvider implements IBiometricProvider {
  async isAvailable(): Promise<boolean> {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return hasHardware && isEnrolled;
  }

  async authenticate(reason: string): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      // The passcode flow is our own 6-digit unlock screen, not the OS one.
      disableDeviceFallback: true,
      cancelLabel: 'Cancel',
    });
    return result.success;
  }
}

/** Which biometric modality the device exposes, for screen presentation. */
export type BiometricMethod = 'face' | 'touch';

export interface BiometricModalities {
  /** The modality to lead with — Face ID when the device offers it. */
  method: BiometricMethod;
  /** Whether the device supports both modalities, so the user can switch. */
  canSwitch: boolean;
}

/**
 * Inspects the device's enrolled biometric hardware so the enrollment screen
 * can label itself correctly (Face ID vs fingerprint). Purely a presentation
 * concern — the actual unlock secret is enrolled through the security domain,
 * which is platform-agnostic. Face ID is preferred when both are present.
 */
export async function getBiometricModalities(): Promise<BiometricModalities> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
  return {
    method: hasFace ? 'face' : 'touch',
    canSwitch: hasFace && hasFingerprint,
  };
}
