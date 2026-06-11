import { ChainErrors } from '@flama/chain-core';
import { describe, expect, it } from 'vitest';
import { xrplResultToError, xrplRpcError } from './errors';

describe('xrplResultToError', () => {
  it('maps insufficient-funds engine codes regardless of class prefix', () => {
    expect(xrplResultToError('tecUNFUNDED_PAYMENT')).toBe(ChainErrors.INSUFFICIENT_FUNDS);
    expect(xrplResultToError('tecINSUFFICIENT_RESERVE')).toBe(ChainErrors.INSUFFICIENT_FUNDS);
    expect(xrplResultToError('telINSUF_FEE_P')).toBe(ChainErrors.INSUFFICIENT_FUNDS);
  });

  it('maps malformed (tem) codes to INVALID_TRANSACTION', () => {
    expect(xrplResultToError('temBAD_AMOUNT')).toBe(ChainErrors.INVALID_TRANSACTION);
  });

  it('maps node-rejected (tef/tel/ter) codes to TRANSACTION_REJECTED', () => {
    expect(xrplResultToError('tefPAST_SEQ')).toBe(ChainErrors.TRANSACTION_REJECTED);
    expect(xrplResultToError('telCAN_NOT_QUEUE')).toBe(ChainErrors.TRANSACTION_REJECTED);
    expect(xrplResultToError('terQUEUED')).toBe(ChainErrors.TRANSACTION_REJECTED);
  });

  it('maps applied-but-failed (tec) and unknown codes to TRANSACTION_FAILED', () => {
    expect(xrplResultToError('tecNO_DST')).toBe(ChainErrors.TRANSACTION_FAILED);
    expect(xrplResultToError('something_unexpected')).toBe(ChainErrors.TRANSACTION_FAILED);
  });
});

describe('xrplRpcError', () => {
  it('maps actNotFound to ACCOUNT_NOT_FOUND', () => {
    const error = xrplRpcError('actNotFound', 'Account not found.', 'xrpl:testnet');
    expect(error.code).toBe(ChainErrors.ACCOUNT_NOT_FOUND.code);
    expect(error.chainId).toBe('xrpl:testnet');
    expect(error.detail).toBe('actNotFound');
  });

  it('maps any other RPC error to RPC with the message as detail', () => {
    const error = xrplRpcError('invalidParams', 'Missing field.', 'xrpl:testnet');
    expect(error.code).toBe(ChainErrors.RPC.code);
    expect(error.detail).toBe('Missing field.');
  });
});
