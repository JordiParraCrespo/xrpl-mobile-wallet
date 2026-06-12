import type { Signer } from './signer';
import type {
  AccountTxPage,
  AccountTxQuery,
  Balance,
  Block,
  NetworkConfig,
  RegisterTokenParams,
  TokenBalance,
  TokenInfo,
  TokenTransferParams,
  TransferParams,
  TxResult,
} from './types';

export interface ChainAdapter {
  readonly config: NetworkConfig;
  deriveAddress(publicKey: Uint8Array): string;
  isValidAddress(address: string): boolean;
  getBalance(address: string): Promise<Balance>;
  /** Most recently validated blocks/ledgers, newest first. */
  getRecentBlocks(limit?: number): Promise<Block[]>;
  /** Builds, signs (via the external signer), submits and awaits confirmation. */
  transfer(params: TransferParams, signer: Signer): Promise<TxResult>;
  /**
   * Ask the network faucet to fund an address. Only available on test
   * networks that declare a `faucetUrl` in their config.
   */
  requestFaucet?(address: string): Promise<void>;
  /** Non-native fungible tokens (issued currencies / ERC-20s) held by `address`. */
  listTokens(address: string): Promise<TokenBalance[]>;
  /** Balance of a single non-native token held by `address`. */
  getTokenBalance(address: string, token: TokenInfo): Promise<TokenBalance>;
  /** Builds, signs, submits and awaits a non-native token transfer. */
  transferToken(params: TokenTransferParams, signer: Signer): Promise<TxResult>;
  /**
   * Authorizes the account to hold a token (XRPL trustline via TrustSet).
   * Optional: chains that require no on-chain registration omit it.
   */
  registerToken?(params: RegisterTokenParams, signer: Signer): Promise<TxResult>;
  /**
   * Past transactions for an account, newest first, with cursor pagination.
   * Optional: requires an indexed history source (XRPL `account_tx`; EVM a
   * block-explorer API via `config.explorerApiUrl`). Adapters without one omit
   * it, and callers treat its absence as "history unavailable on this chain".
   */
  getAccountTransactions?(address: string, query?: AccountTxQuery): Promise<AccountTxPage>;
}
