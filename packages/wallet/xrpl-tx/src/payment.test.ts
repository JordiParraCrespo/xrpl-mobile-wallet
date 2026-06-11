import { ChainError, ChainErrors } from '@flama/chain-core';
import { describe, expect, it } from 'vitest';
import { PaymentTransaction } from './payment';
import { TransactionRegistry } from './registry';
import type { TxContext } from './transaction';

// Real, checksum-valid classic addresses.
const SENDER = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
const DESTINATION = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe';
// Same shape as DESTINATION but with a broken checksum (last char changed).
const BAD_CHECKSUM = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYf';

const ctx = (over: Partial<TxContext> = {}): TxContext => ({
  account: SENDER,
  sequence: 42,
  ledgerIndex: 1000,
  balanceDrops: 100_000_000n, // 100 XRP
  reserveDrops: 10_000_000n, // 10 XRP
  feeDrops: 12n,
  ...over,
});

const captureError = (fn: () => unknown): unknown => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('Expected the function to throw');
};

describe('PaymentTransaction', () => {
  const payment = new PaymentTransaction();

  it('prepares a canonical unsigned payment', () => {
    const { tx, summary, risk } = payment.prepare(
      { destination: DESTINATION, amount: '1.5' },
      ctx(),
    );

    expect(tx).toEqual({
      TransactionType: 'Payment',
      Account: SENDER,
      Destination: DESTINATION,
      Amount: '1500000',
      Fee: '12',
      Sequence: 42,
      LastLedgerSequence: 1020,
    });
    expect(risk).toBe('high');
    expect(summary.type).toBe('Payment');
    expect(summary.totalDebitDrops).toBe(1_500_012n);
  });

  it('includes destination tag and an encoded memo when provided', () => {
    const { tx, summary } = payment.prepare(
      {
        destination: DESTINATION,
        amount: '2',
        destinationTag: 42,
        memo: 'hello',
      },
      ctx(),
    );

    expect(tx.DestinationTag).toBe(42);
    // "hello" UTF-8 → hex, upper-cased.
    expect(tx.Memos).toEqual([{ Memo: { MemoData: '68656C6C6F' } }]);
    expect(summary.lines).toContainEqual({
      label: 'Destination tag',
      value: '42',
    });
    expect(summary.lines).toContainEqual({ label: 'Memo', value: 'hello' });
  });

  it('rejects an amount with more than 6 decimals (schema gate)', () => {
    expect(() =>
      payment.prepare({ destination: DESTINATION, amount: '1.1234567' }, ctx()),
    ).toThrow();
  });

  it('rejects a mis-shaped destination (schema gate)', () => {
    expect(() => payment.prepare({ destination: 'not-an-address', amount: '1' }, ctx())).toThrow();
  });

  it('rejects a shape-valid but bad-checksum address (domain gate)', () => {
    const error = captureError(() =>
      payment.prepare({ destination: BAD_CHECKSUM, amount: '1' }, ctx()),
    );
    expect(error).toBeInstanceOf(ChainError);
    expect((error as ChainError).code).toBe(ChainErrors.INVALID_TRANSACTION.code);
  });

  it('rejects a payment to self', () => {
    const error = captureError(() => payment.prepare({ destination: SENDER, amount: '1' }, ctx()));
    expect((error as ChainError).code).toBe(ChainErrors.SELF_PAYMENT.code);
  });

  it('rejects a payment that exceeds the spendable balance', () => {
    const error = captureError(() =>
      payment.prepare(
        { destination: DESTINATION, amount: '1' },
        ctx({ balanceDrops: 10_000_000n, reserveDrops: 10_000_000n }),
      ),
    );
    expect((error as ChainError).code).toBe(ChainErrors.INSUFFICIENT_FUNDS.code);
  });
});

describe('TransactionRegistry', () => {
  it('resolves a registered transaction by type and prepares through it', () => {
    const registry = new TransactionRegistry([new PaymentTransaction()]);
    const { tx } = registry
      .get('Payment')
      .prepare({ destination: DESTINATION, amount: '1' }, ctx());
    expect(tx.TransactionType).toBe('Payment');
  });

  it('throws for an unregistered type', () => {
    const registry = new TransactionRegistry([new PaymentTransaction()]);
    expect(() => registry.get('TrustSet')).toThrow();
  });
});
