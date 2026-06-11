import type { PreparableTransaction } from './transaction';

/**
 * Maps an XRPL TransactionType to the class that prepares it, mirroring
 * `ChainRegistry`. The agent tools and the signing path resolve operations by
 * type through this, so adding an operation never touches the call sites.
 */
export class TransactionRegistry {
  private readonly transactions = new Map<string, PreparableTransaction>();

  constructor(transactions: PreparableTransaction[] = []) {
    for (const transaction of transactions) {
      this.register(transaction);
    }
  }

  register(transaction: PreparableTransaction): void {
    this.transactions.set(transaction.type, transaction);
  }

  get(type: string): PreparableTransaction {
    const transaction = this.transactions.get(type);
    if (!transaction) {
      throw new Error(`No transaction registered for type "${type}"`);
    }
    return transaction;
  }

  list(): PreparableTransaction[] {
    return [...this.transactions.values()];
  }
}
