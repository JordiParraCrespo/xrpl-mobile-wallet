import type { z } from 'zod';

/**
 * Read-only view of the chain state a transaction needs to validate and build
 * itself. The caller (an adapter on the device, or the agent's read client on
 * the backend) fetches these once and hands them to `prepare`.
 */
export interface TxContext {
  /** The sender's classic r-address. */
  account: string;
  /** Current account sequence. */
  sequence: number;
  /** Current validated ledger index ("block"); used for LastLedgerSequence. */
  ledgerIndex: number;
  /** Account's spendable balance, in drops. */
  balanceDrops: bigint;
  /** Base + owner reserve that must remain, in drops. */
  reserveDrops: bigint;
  /** Network fee to apply, in drops. */
  feeDrops: bigint;
}

export interface TxSummaryLine {
  label: string;
  value: string;
}

/**
 * Human-readable, ground-truth summary of a prepared transaction. This is what
 * an approval UI renders — never a model-narrated description — so the user
 * confirms exactly what will be signed.
 */
export interface TxSummary {
  /** XRPL TransactionType, e.g. "Payment". */
  type: string;
  lines: TxSummaryLine[];
  /** Total debited from the sender (amount + fee), in drops. */
  totalDebitDrops: bigint;
}

/** Coarse risk used to classify a transaction for the approval pipeline. */
export type RiskLevel = 'read' | 'low' | 'high';

/** The fully-formed, unsigned canonical tx plus everything callers need. */
export interface PreparedTransaction<TParams> {
  params: TParams;
  /** Canonical, unsigned tx JSON ready for serialization and signing. */
  tx: Record<string, unknown>;
  summary: TxSummary;
  risk: RiskLevel;
}

/**
 * Parameter-erased view of a transaction, used by registries and the agent so
 * they can prepare any operation by type without knowing its param shape.
 */
export interface PreparableTransaction {
  readonly type: string;
  prepare(rawInput: unknown, ctx: TxContext): PreparedTransaction<unknown>;
}

/**
 * One XRPL operation type = one subclass. Encapsulates input validation (zod),
 * domain validation against live chain state, canonical tx construction, and
 * the approval summary. New operations (TrustSet, escrow, ...) plug in here as
 * new subclasses with zero changes to the agent loop or the signing path.
 */
export abstract class XrplTransaction<TParams> implements PreparableTransaction {
  /** XRPL TransactionType. */
  abstract readonly type: string;
  /** Zod schema for raw, user/model-supplied input. The first validation gate. */
  abstract readonly schema: z.ZodType<TParams>;
  /** Coarse risk for approval classification. */
  abstract risk(params: TParams): RiskLevel;
  /**
   * Domain checks against live chain state. Throws a `ChainError` from the
   * shared catalog when the transaction cannot proceed.
   */
  abstract validate(params: TParams, ctx: TxContext): void;
  /** Builds the canonical, unsigned tx JSON ready for serialization. */
  abstract build(params: TParams, ctx: TxContext): Record<string, unknown>;
  /** Ground-truth summary for the human approval gate. */
  abstract summarize(params: TParams, ctx: TxContext): TxSummary;

  /** Parse → validate → build, returning everything callers need. */
  prepare(rawInput: unknown, ctx: TxContext): PreparedTransaction<TParams> {
    const params = this.schema.parse(rawInput);
    this.validate(params, ctx);
    return {
      params,
      tx: this.build(params, ctx),
      summary: this.summarize(params, ctx),
      risk: this.risk(params),
    };
  }
}
