import { formatUnits, parseUnits, type TxContext } from '@flama/chain-core';
import { type PaymentInput, paymentInputSchema, XRP_DECIMALS } from '@flama/shared';
import { isValidClassicAddress } from 'ripple-address-codec';
import { encodeMemo } from './memo';
import {
  type RiskLevel,
  type TxSummary,
  type ValidationIssue,
  XrplTransaction,
} from './transaction';

/** Ledgers added to the current index to set LastLedgerSequence (~1 min). */
const LEDGER_BUFFER = 20;

/** Stable codes for the domain issues a payment can raise. */
export const PaymentIssue = {
  INVALID_DESTINATION: 'invalid_destination',
  SELF_PAYMENT: 'self_payment',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
} as const;

/**
 * Configurable fields of a native XRP payment. New optional fields (invoice id,
 * delivered amount, paths, ...) are added here without touching the base class,
 * the agent, or the signing path.
 */
export type PaymentParams = PaymentInput;

/**
 * Native XRP payment. The v1 operation: send an amount of XRP to a destination,
 * optionally with a destination tag (required by most exchanges) and a memo.
 */
export class PaymentTransaction extends XrplTransaction<PaymentParams> {
  readonly type = 'Payment';
  readonly schema = paymentInputSchema;

  /** Moving value is always high risk — every payment is gated for approval. */
  risk(): RiskLevel {
    return 'high';
  }

  validate(params: PaymentParams, ctx: TxContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    // Authoritative checksum check (the schema only verified the shape).
    if (!isValidClassicAddress(params.destination)) {
      issues.push({
        code: PaymentIssue.INVALID_DESTINATION,
        field: 'destination',
        message: 'The destination is not a valid XRPL address',
      });
      // Without a valid address the remaining checks are not meaningful.
      return issues;
    }
    if (params.destination === ctx.account) {
      issues.push({
        code: PaymentIssue.SELF_PAYMENT,
        field: 'destination',
        message: 'The destination is the same as the sender',
      });
    }
    const spendable = ctx.balanceDrops - ctx.reserveDrops;
    if (spendable < this.amountDrops(params) + ctx.feeDrops) {
      issues.push({
        code: PaymentIssue.INSUFFICIENT_FUNDS,
        field: 'amount',
        message: 'The amount plus fee exceeds the spendable balance after reserve',
      });
    }
    return issues;
  }

  build(params: PaymentParams, ctx: TxContext): Record<string, unknown> {
    const tx: Record<string, unknown> = {
      TransactionType: 'Payment',
      Account: ctx.account,
      Destination: params.destination,
      Amount: this.amountDrops(params).toString(),
      Fee: ctx.feeDrops.toString(),
      Sequence: ctx.sequence,
      LastLedgerSequence: ctx.ledgerIndex + LEDGER_BUFFER,
    };
    if (params.destinationTag !== undefined) {
      tx.DestinationTag = params.destinationTag;
    }
    if (params.memo) {
      tx.Memos = [encodeMemo(params.memo)];
    }
    return tx;
  }

  summarize(params: PaymentParams, ctx: TxContext): TxSummary {
    const amountDrops = this.amountDrops(params);
    const total = amountDrops + ctx.feeDrops;
    const lines = [
      { label: 'To', value: params.destination },
      {
        label: 'Amount',
        value: `${formatUnits(amountDrops, XRP_DECIMALS)} XRP`,
      },
      {
        label: 'Network fee',
        value: `${formatUnits(ctx.feeDrops, XRP_DECIMALS)} XRP`,
      },
    ];
    if (params.destinationTag !== undefined) {
      lines.push({
        label: 'Destination tag',
        value: String(params.destinationTag),
      });
    }
    if (params.memo) {
      lines.push({ label: 'Memo', value: params.memo });
    }
    lines.push({
      label: 'Total',
      value: `${formatUnits(total, XRP_DECIMALS)} XRP`,
    });
    return { type: this.type, lines, totalDebitDrops: total };
  }

  /** Converts the human XRP amount string to drops. */
  private amountDrops(params: PaymentParams): bigint {
    return parseUnits(params.amount, XRP_DECIMALS);
  }
}
