import type { TxContext } from '@flama/chain-core';
import { describe, expect, it } from 'vitest';
import { PaymentIssue, PaymentTransaction } from './payment';
import { TransactionRegistry } from './registry';
import { SCHEMA_ISSUE_CODE } from './transaction';

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

describe('PaymentTransaction', () => {
  const payment = new PaymentTransaction();

  it('prepares a canonical unsigned payment', () => {
    const result = payment.prepare({ destination: DESTINATION, amount: '1.5' }, ctx());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tx).toEqual({
      TransactionType: 'Payment',
      Account: SENDER,
      Destination: DESTINATION,
      Amount: '1500000',
      Fee: '12',
      Sequence: 42,
      LastLedgerSequence: 1020,
    });
    expect(result.risk).toBe('high');
    expect(result.summary.type).toBe('Payment');
    expect(result.summary.totalDebitDrops).toBe(1_500_012n);
  });

  it('includes destination tag and an encoded memo when provided', () => {
    const result = payment.prepare(
      {
        destination: DESTINATION,
        amount: '2',
        destinationTag: 42,
        memo: 'hello',
      },
      ctx(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tx.DestinationTag).toBe(42);
    // "hello" UTF-8 → hex, upper-cased.
    expect(result.tx.Memos).toEqual([{ Memo: { MemoData: '68656C6C6F' } }]);
    expect(result.summary.lines).toContainEqual({
      label: 'Destination tag',
      value: '42',
    });
    expect(result.summary.lines).toContainEqual({
      label: 'Memo',
      value: 'hello',
    });
  });

  it('reports a schema issue for an amount with more than 6 decimals', () => {
    const result = payment.prepare({ destination: DESTINATION, amount: '1.1234567' }, ctx());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0]).toMatchObject({
      code: SCHEMA_ISSUE_CODE,
      field: 'amount',
    });
  });

  it('reports a schema issue for a mis-shaped destination', () => {
    const result = payment.prepare({ destination: 'not-an-address', amount: '1' }, ctx());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0]).toMatchObject({
      code: SCHEMA_ISSUE_CODE,
      field: 'destination',
    });
  });

  it('reports a domain issue for a shape-valid but bad-checksum address', () => {
    const result = payment.prepare({ destination: BAD_CHECKSUM, amount: '1' }, ctx());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((i) => i.code)).toContain(PaymentIssue.INVALID_DESTINATION);
  });

  it('reports a domain issue for a payment to self', () => {
    const result = payment.prepare({ destination: SENDER, amount: '1' }, ctx());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((i) => i.code)).toContain(PaymentIssue.SELF_PAYMENT);
  });

  it('reports a domain issue when the amount exceeds the spendable balance', () => {
    const result = payment.prepare(
      { destination: DESTINATION, amount: '1' },
      ctx({ balanceDrops: 10_000_000n, reserveDrops: 10_000_000n }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((i) => i.code)).toContain(PaymentIssue.INSUFFICIENT_FUNDS);
  });
});

describe('TransactionRegistry', () => {
  it('resolves a registered transaction by type and prepares through it', () => {
    const registry = new TransactionRegistry([new PaymentTransaction()]);
    const result = registry
      .get('Payment')
      .prepare({ destination: DESTINATION, amount: '1' }, ctx());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tx.TransactionType).toBe('Payment');
  });

  it('throws for an unregistered type', () => {
    const registry = new TransactionRegistry([new PaymentTransaction()]);
    expect(() => registry.get('TrustSet')).toThrow();
  });
});
