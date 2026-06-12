import type {
  AccountTxPage,
  AccountTxQuery,
  Block,
  ChainAdapter,
  ChainRegistry,
} from '@flama/chain-core';
import { inject, injectable } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { AppError } from '../core/errors';
import { ExplorerErrors } from './explorer.errors';

/**
 * Read-only chain/ledger data. Lives outside the wallet module since recent
 * blocks are not tied to a wallet account — they describe the chain itself.
 */
@injectable()
export class ExplorerService {
  constructor(
    @inject(TOKENS.ChainRegistry)
    private readonly chains: ChainRegistry,
  ) {}

  /** Most recently validated blocks/ledgers for a chain, newest first. */
  async getRecentBlocks(chainId: string, limit?: number): Promise<Block[]> {
    return this.chains.get(chainId).getRecentBlocks(limit);
  }

  /**
   * Past transactions for an account on a chain, newest first, with cursor
   * pagination. Throws HISTORY_UNAVAILABLE when the chain's adapter has no
   * indexed history source, UNKNOWN_CHAIN when the chain isn't registered.
   */
  async getAccountTransactions(
    chainId: string,
    address: string,
    query?: AccountTxQuery,
  ): Promise<AccountTxPage> {
    let adapter: ChainAdapter;
    try {
      adapter = this.chains.get(chainId);
    } catch {
      throw new AppError(ExplorerErrors.UNKNOWN_CHAIN);
    }

    if (!adapter.getAccountTransactions) {
      throw new AppError(ExplorerErrors.HISTORY_UNAVAILABLE);
    }

    return adapter.getAccountTransactions(address, query);
  }
}
