import { ChainError, ChainErrors, formatUnits, parseUnits } from '@flama/chain-core';
import { type PaymentInput, paymentInputSchema, XRP_DECIMALS } from '@flama/shared';
import { isValidClassicAddress } from 'ripple-address-codec';
import { encodeMemo } from './memo';
import { type RiskLevel, type TxContext, type TxSummary, XrplTransaction } from './transaction';

/** Ledgers added to the current index to set LastLedgerSequence (~1 min). */
const LEDGER_BUFFER = 20;

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

  validate(params: PaymentParams, ctx: TxContext): void {
    // Authoritative checksum check (the schema only verified the shape).
    if (!isValidClassicAddress(params.destination)) {
      throw new ChainError(ChainErrors.INVALID_TRANSACTION, {
        detail: 'Invalid destination address',
      });
    }
    if (params.destination === ctx.account) {
      throw new ChainError(ChainErrors.SELF_PAYMENT);
    }
    const spendable = ctx.balanceDrops - ctx.reserveDrops;
    if (spendable < this.amountDrops(params) + ctx.feeDrops) {
      throw new ChainError(ChainErrors.INSUFFICIENT_FUNDS);
    }
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
