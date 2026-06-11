import { describe, expect, it } from 'vitest';
import { ChainError, ChainErrors, toChainError } from './errors';

describe('ChainError', () => {
  it('carries the common code, message and context', () => {
    const cause = new Error('boom');
    const error = new ChainError(ChainErrors.INSUFFICIENT_FUNDS, {
      chainId: 'xrpl:testnet',
      detail: 'tecUNFUNDED_PAYMENT',
      cause,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ChainError');
    expect(error.code).toBe('CHAIN_004');
    expect(error.message).toBe(ChainErrors.INSUFFICIENT_FUNDS.message);
    expect(error.chainId).toBe('xrpl:testnet');
    expect(error.detail).toBe('tecUNFUNDED_PAYMENT');
    expect(error.cause).toBe(cause);
  });
});

describe('toChainError', () => {
  it('passes an existing ChainError through unchanged', () => {
    const original = new ChainError(ChainErrors.NETWORK, {
      chainId: 'evm:1449000',
    });
    expect(toChainError(original, 'evm:1440000')).toBe(original);
  });

  it('wraps an unknown error as CHAIN_999 with the cause preserved', () => {
    const cause = new Error('something odd');
    const error = toChainError(cause, 'xrpl:testnet');

    expect(error).toBeInstanceOf(ChainError);
    expect(error.code).toBe('CHAIN_999');
    expect(error.chainId).toBe('xrpl:testnet');
    expect(error.detail).toBe('something odd');
    expect(error.cause).toBe(cause);
  });

  it('stringifies non-Error values for the detail', () => {
    expect(toChainError('plain string').detail).toBe('plain string');
  });
});
