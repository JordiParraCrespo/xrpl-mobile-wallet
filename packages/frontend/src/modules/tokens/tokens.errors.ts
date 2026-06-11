import type { ErrorDefinition } from '../core/errors';

export const TokensErrors = {
  NOT_INITIALIZED: {
    code: 'TOKENS_CLIENT_001',
    message: 'No wallet has been imported yet',
  },
  INVALID_ADDRESS: {
    code: 'TOKENS_CLIENT_002',
    message: 'The destination address is not valid',
  },
  UNKNOWN_CHAIN: {
    code: 'TOKENS_CLIENT_003',
    message: 'Unknown chain',
  },
} as const satisfies Record<string, ErrorDefinition>;
