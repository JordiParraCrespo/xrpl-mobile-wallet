import type { ErrorDefinition } from '../core/errors';

export const WalletErrors = {
  INVALID_MNEMONIC: {
    code: 'WALLET_CLIENT_001',
    message: 'The recovery phrase is not valid',
  },
  NOT_INITIALIZED: {
    code: 'WALLET_CLIENT_002',
    message: 'No wallet has been imported yet',
  },
  INVALID_ADDRESS: {
    code: 'WALLET_CLIENT_003',
    message: 'The destination address is not valid',
  },
  UNKNOWN_CHAIN: {
    code: 'WALLET_CLIENT_004',
    message: 'Unknown chain',
  },
} as const satisfies Record<string, ErrorDefinition>;
