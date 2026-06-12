import type { LedgerTransaction } from '@flama/chain-core';
import { describe, expect, it } from 'vitest';
import { buildPaymentsFeed, shortenAddress } from './address-book.merge';
import type { Contact } from './address-book.state';

const contact = (over: Partial<Contact>): Contact => ({
  id: 'c1',
  name: 'Maria Gutiérrez',
  kind: 'individual',
  chainId: 'xrpl:testnet',
  address: 'rMARIA0000000000000000000000000',
  createdAt: 1,
  ...over,
});

const tx = (over: Partial<LedgerTransaction>): LedgerTransaction => ({
  hash: 'h1',
  timestamp: 100,
  kind: 'payment',
  direction: 'in',
  success: true,
  amount: 60_000_000n, // 60 XRP in drops
  symbol: 'XRP',
  ...over,
});

describe('buildPaymentsFeed', () => {
  it('resolves a known counterparty to the saved contact name', () => {
    const { recents } = buildPaymentsFeed(
      [tx({ counterparty: 'rMARIA0000000000000000000000000' })],
      [contact({})],
      { decimals: 6 },
    );

    expect(recents).toHaveLength(1);
    expect(recents[0]).toMatchObject({
      name: 'Maria Gutiérrez',
      contactId: 'c1',
      known: true,
      amount: 60,
      direction: 'in',
      subtitle: 'Sent you',
    });
  });

  it('falls back to a shortened address for unknown counterparties', () => {
    const { recents } = buildPaymentsFeed(
      [
        tx({
          counterparty: 'rUNKNOWNxxxxxxxxxxxxxxxxxxxWXYZ',
          direction: 'out',
        }),
      ],
      [],
      { decimals: 6 },
    );

    expect(recents[0].known).toBe(false);
    expect(recents[0].name).toBe(shortenAddress('rUNKNOWNxxxxxxxxxxxxxxxxxxxWXYZ'));
    expect(recents[0].subtitle).toBe('You sent');
  });

  it('matches addresses case-insensitively', () => {
    const { recents } = buildPaymentsFeed(
      [tx({ counterparty: 'rmaria0000000000000000000000000' })],
      [contact({})],
      { decimals: 6 },
    );

    expect(recents[0].known).toBe(true);
  });

  it('merges saved contacts and recent counterparties into the people rail', () => {
    const { people } = buildPaymentsFeed(
      [
        tx({
          hash: 'h1',
          counterparty: 'rSTRANGER000000000000000000WXYZ',
          timestamp: 200,
        }),
        tx({
          hash: 'h2',
          counterparty: 'rMARIA0000000000000000000000000',
          timestamp: 300,
        }),
      ],
      [contact({})],
      { decimals: 6 },
    );

    // Known contact (Maria) leads; the stranger follows.
    expect(people.map((p) => p.known)).toEqual([true, false]);
    expect(people[0].name).toBe('Maria Gutiérrez');
    // Maria appears once even though she has both a contact and a transaction.
    expect(people.filter((p) => p.name === 'Maria Gutiérrez')).toHaveLength(1);
  });

  it('orders unknown people by most recent interaction', () => {
    const { people } = buildPaymentsFeed(
      [
        tx({
          hash: 'h1',
          counterparty: 'rOLD0000000000000000000000000000',
          timestamp: 100,
        }),
        tx({
          hash: 'h2',
          counterparty: 'rNEW0000000000000000000000000000',
          timestamp: 900,
        }),
      ],
      [],
      { decimals: 6 },
    );

    expect(people[0].address).toBe('rNEW0000000000000000000000000000');
  });
});
