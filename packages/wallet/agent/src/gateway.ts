import type { Balance, Block, Signer, TxContext, TxResult } from '@flama/chain-core';
import type { XrplAdapter } from '@flama/chain-xrpl';

/**
 * The agent's view of a wallet. The agent never holds keys: it reads state and,
 * for a transaction the user has approved, calls `signAndSubmit`. On a server
 * this could instead hand the unsigned tx to the device to sign; the interface
 * is the seam where that swap happens.
 */
export interface WalletGateway {
  /** The bound wallet's address. */
  readonly address: string;
  /** Explorer base URL, when the network has one. */
  readonly explorerUrl?: string;
  getBalance(): Promise<Balance>;
  getRecentBlocks(limit?: number): Promise<Block[]>;
  /** Read-only chain state for preparing a transaction. */
  buildContext(): Promise<TxContext>;
  /** Signs and submits an already-built, approved transaction. */
  signAndSubmit(tx: Record<string, unknown>): Promise<TxResult>;
}

/**
 * XRPL wallet gateway backed by {@link XrplAdapter} and a {@link Signer}. The
 * signer stays inside the gateway; the agent only ever calls these methods.
 */
export class XrplWalletGateway implements WalletGateway {
  constructor(
    private readonly adapter: XrplAdapter,
    readonly address: string,
    private readonly signer: Signer,
  ) {}

  get explorerUrl(): string | undefined {
    return this.adapter.config.explorerUrl;
  }

  getBalance(): Promise<Balance> {
    return this.adapter.getBalance(this.address);
  }

  getRecentBlocks(limit?: number): Promise<Block[]> {
    return this.adapter.getRecentBlocks(limit);
  }

  buildContext(): Promise<TxContext> {
    return this.adapter.buildContext(this.address);
  }

  signAndSubmit(tx: Record<string, unknown>): Promise<TxResult> {
    return this.adapter.signAndSubmit(tx, this.signer);
  }
}
