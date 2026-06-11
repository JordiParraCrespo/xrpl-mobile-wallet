import type { Signer } from './signer';
import type { Balance, NetworkConfig, TransferParams, TxResult } from './types';

export interface ChainAdapter {
  readonly config: NetworkConfig;
  deriveAddress(publicKey: Uint8Array): string;
  isValidAddress(address: string): boolean;
  getBalance(address: string): Promise<Balance>;
  /** Builds, signs (via the external signer), submits and awaits confirmation. */
  transfer(params: TransferParams, signer: Signer): Promise<TxResult>;
}
