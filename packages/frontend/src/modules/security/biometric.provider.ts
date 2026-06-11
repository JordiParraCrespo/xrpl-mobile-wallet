/**
 * Platform biometric authenticator (Face ID / Touch ID / fingerprint).
 * Apps inject a platform-specific implementation via {@link FlamaAppConfig}.
 */
export interface IBiometricProvider {
  isAvailable(): Promise<boolean>;
  authenticate(reason: string): Promise<boolean>;
}

/** Fallback bound when the app provides no biometric provider. */
export class UnavailableBiometricProvider implements IBiometricProvider {
  isAvailable(): Promise<boolean> {
    return Promise.resolve(false);
  }

  authenticate(_reason: string): Promise<boolean> {
    return Promise.resolve(false);
  }
}
