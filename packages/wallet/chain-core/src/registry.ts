import type { ChainAdapter } from './adapter';

export class ChainRegistry {
  private readonly adapters = new Map<string, ChainAdapter>();

  constructor(adapters: ChainAdapter[] = []) {
    for (const adapter of adapters) {
      this.register(adapter);
    }
  }

  register(adapter: ChainAdapter): void {
    this.adapters.set(adapter.config.chainId, adapter);
  }

  get(chainId: string): ChainAdapter {
    const adapter = this.adapters.get(chainId);
    if (!adapter) {
      throw new Error(`No chain adapter registered for "${chainId}"`);
    }
    return adapter;
  }

  /** Whether an adapter is registered for `chainId`. */
  has(chainId: string): boolean {
    return this.adapters.has(chainId);
  }

  list(): ChainAdapter[] {
    return [...this.adapters.values()];
  }
}
