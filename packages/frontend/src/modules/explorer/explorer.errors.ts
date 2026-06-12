import type { ErrorDefinition } from '../core/errors';

export const ExplorerErrors = {
  HISTORY_UNAVAILABLE: {
    code: 'EXPLORER_CLIENT_001',
    message: 'Transaction history is not available for this network',
  },
  UNKNOWN_CHAIN: {
    code: 'EXPLORER_CLIENT_002',
    message: 'Unknown chain',
  },
} as const satisfies Record<string, ErrorDefinition>;
