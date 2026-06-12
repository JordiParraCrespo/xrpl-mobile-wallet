import type { ErrorDefinition } from '../core/errors';

export const ProfileErrors = {
  INVALID_NAME: {
    code: 'PROFILE_CLIENT_001',
    message: 'Enter a name with at least 2 characters',
  },
} as const satisfies Record<string, ErrorDefinition>;
