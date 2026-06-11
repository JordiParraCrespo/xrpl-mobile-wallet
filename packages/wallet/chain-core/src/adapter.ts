import type { Signer } from './signer';
import type {
  Balance,
  Block,
  NetworkConfig,
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
  /** Non-native fungible tokens (issued currencies / ERC-20s) held by `address`. */
  listTokens(address: string): Promise<TokenBalance[]>;
  /** Balance of a single non-native token held by `address`. */
  getTokenBalance(address: string, token: TokenInfo): Promise<TokenBalance>;
  /** Builds, signs, submits and awaits a non-native token transfer. */
  transferToken(params: TokenTransferParams, signer: Signer): Promise<TxResult>;
}
