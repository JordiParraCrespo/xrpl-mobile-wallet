import type { Signer } from './signer';
import type { Balance, Block, NetworkConfig, TransferParams, TxResult } from './types';

export interface ChainAdapter {
  readonly config: NetworkConfig;
  deriveAddress(publicKey: Uint8Array): string;
  isValidAddress(address: string): boolean;
  getBalance(address: string): Promise<Balance>;
  /** Most recently validated blocks/ledgers, newest first. */
  getRecentBlocks(limit?: number): Promise<Block[]>;
  /** Builds, signs (via the external signer), submits and awaits confirmation. */
  transfer(params: TransferParams, signer: Signer): Promise<TxResult>;
}
