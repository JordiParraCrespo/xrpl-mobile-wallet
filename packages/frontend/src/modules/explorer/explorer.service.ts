import type { Block, ChainRegistry } from '@flama/chain-core';
import { inject, injectable } from 'inversify';
import { TOKENS } from '../../di/tokens';

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
}
