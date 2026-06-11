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
