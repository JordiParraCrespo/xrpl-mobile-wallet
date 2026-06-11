import type { TxContext } from '@flama/chain-core';
import type { z } from 'zod';

export type { TxContext };

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

/**
 * A single validation problem. Plain data — not a thrown error — so callers can
 * test, branch on `code`, and surface `message`/`field` without try/catch. The
 * agent returns these to the model so it can self-correct.
 */
export interface ValidationIssue {
  /** Stable, machine-branchable code (e.g. "insufficient_funds"). */
  code: string;
  /** Human-readable explanation. */
  message: string;
  /** The offending input field, when the issue maps to one. */
  field?: string;
}

/** Issue code attached to every schema (shape/format) failure. */
export const SCHEMA_ISSUE_CODE = 'invalid_input';

/** The fully-formed, unsigned canonical tx plus everything callers need. */
export interface PreparedTransaction<TParams> {
  params: TParams;
  /** Canonical, unsigned tx JSON ready for serialization and signing. */
  tx: Record<string, unknown>;
  summary: TxSummary;
  risk: RiskLevel;
}

/**
 * Result of preparing a transaction: either a ready-to-sign transaction, or the
 * list of issues that blocked it. No exceptions are thrown for invalid input.
 */
export type PrepareResult<TParams> =
  | ({ ok: true } & PreparedTransaction<TParams>)
  | { ok: false; issues: ValidationIssue[] };

/**
 * Parameter-erased view of a transaction, used by registries and the agent so
 * they can prepare any operation by type without knowing its param shape.
 */
export interface PreparableTransaction {
  readonly type: string;
  prepare(rawInput: unknown, ctx: TxContext): PrepareResult<unknown>;
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
   * Domain checks against live chain state. Returns the issues found (empty when
   * the transaction is valid); never throws.
   */
  abstract validate(params: TParams, ctx: TxContext): ValidationIssue[];
  /** Builds the canonical, unsigned tx JSON ready for serialization. */
  abstract build(params: TParams, ctx: TxContext): Record<string, unknown>;
  /** Ground-truth summary for the human approval gate. */
  abstract summarize(params: TParams, ctx: TxContext): TxSummary;

  /** Parse → validate → build. Returns a result; does not throw on bad input. */
  prepare(rawInput: unknown, ctx: TxContext): PrepareResult<TParams> {
    const parsed = this.schema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, issues: parsed.error.issues.map(toIssue) };
    }
    const params = parsed.data;
    const issues = this.validate(params, ctx);
    if (issues.length > 0) {
      return { ok: false, issues };
    }
    return {
      ok: true,
      params,
      tx: this.build(params, ctx),
      summary: this.summarize(params, ctx),
      risk: this.risk(params),
    };
  }
}

/** Maps a zod issue to the package's flat {@link ValidationIssue} shape. */
function toIssue(issue: z.ZodIssue): ValidationIssue {
  const field = issue.path.join('.');
  return {
    code: SCHEMA_ISSUE_CODE,
    message: issue.message,
    ...(field ? { field } : {}),
  };
}
