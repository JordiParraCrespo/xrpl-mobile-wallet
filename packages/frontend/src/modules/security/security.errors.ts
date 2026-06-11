import type { ErrorDefinition } from '../core/errors';

export const SecurityErrors = {
  INVALID_PASSCODE: {
    code: 'SECURITY_CLIENT_001',
    message: 'The passcode is incorrect',
  },
  INVALID_PASSCODE_FORMAT: {
    code: 'SECURITY_CLIENT_002',
    message: 'The passcode must be 6 digits',
  },
  LOCKED_OUT: {
    code: 'SECURITY_CLIENT_003',
    message: 'Too many incorrect attempts. Please try again later',
  },
  NOT_INITIALIZED: {
    code: 'SECURITY_CLIENT_004',
    message: 'Set up a passcode to secure your wallet first',
  },
  ALREADY_INITIALIZED: {
    code: 'SECURITY_CLIENT_005',
    message: 'A passcode has already been set up',
  },
  BIOMETRICS_UNAVAILABLE: {
    code: 'SECURITY_CLIENT_006',
    message: 'Biometric authentication is not available on this device',
  },
  BIOMETRICS_NOT_ENROLLED: {
    code: 'SECURITY_CLIENT_007',
    message: 'Biometric unlock has not been enabled',
  },
  BIOMETRIC_AUTH_FAILED: {
    code: 'SECURITY_CLIENT_008',
    message: 'Biometric authentication was not confirmed',
  },
} as const satisfies Record<string, ErrorDefinition>;
