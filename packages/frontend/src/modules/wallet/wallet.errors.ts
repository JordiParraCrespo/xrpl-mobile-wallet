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
  WALLET_LOCKED: {
    code: 'WALLET_CLIENT_005',
    message: 'Unlock your wallet first',
  },
  INVALID_FAMILY_SEED: {
    code: 'WALLET_CLIENT_006',
    message: 'The family seed is not valid',
  },
  INVALID_SECRET_NUMBERS: {
    code: 'WALLET_CLIENT_007',
    message: 'The secret numbers are not valid',
  },
  UNSUPPORTED_CHAIN: {
    code: 'WALLET_CLIENT_008',
    message: 'This wallet cannot use this network',
  },
  FAUCET_UNAVAILABLE: {
    code: 'WALLET_CLIENT_009',
    message: 'No faucet is available for this network',
  },
} as const satisfies Record<string, ErrorDefinition>;
