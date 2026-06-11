import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { type IBiometricProvider, UnavailableBiometricProvider } from './biometric.provider';
import { SecurityService } from './security.service';
import { createSecurityStore } from './security.state';

/**
 * Binds the local-authentication module: passcode lifecycle, biometric
 * unlock and lockout policy. Pass the platform biometric provider, or omit
 * it to disable biometrics.
 */
export function createSecurityModule(biometricProvider?: IBiometricProvider): ContainerModule {
  return new ContainerModule(({ bind }) => {
    bind(TOKENS.SecurityStore).toConstantValue(createSecurityStore());
    bind(TOKENS.BiometricProvider).toConstantValue(
      biometricProvider ?? new UnavailableBiometricProvider(),
    );
    bind(TOKENS.SecurityService).to(SecurityService).inSingletonScope();
  });
}
