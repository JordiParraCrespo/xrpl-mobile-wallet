import type { ErrorDefinition } from '../core/errors';

export const SettingsErrors = {
  UNSUPPORTED_CURRENCY: {
    code: 'SETTINGS_CLIENT_001',
    message: 'That display currency is not supported',
  },
  INVALID_APPEARANCE: {
    code: 'SETTINGS_CLIENT_002',
    message: 'Unknown appearance mode',
  },
} as const satisfies Record<string, ErrorDefinition>;
