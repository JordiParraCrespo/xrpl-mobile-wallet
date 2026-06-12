import { describe, expect, it, vi } from 'vitest';
import { createToolGate, evaluatePolicy } from './policy';
import { SUBMIT_PAYMENT_TOOL } from './tools';

describe('evaluatePolicy', () => {
  it('denies a payment above the cap', () => {
    expect(evaluatePolicy({ maxPaymentXrp: 50 }, { amount: '75' }).allowed).toBe(false);
  });

  it('allows a payment within the cap', () => {
    expect(evaluatePolicy({ maxPaymentXrp: 50 }, { amount: '25' }).allowed).toBe(true);
  });

  it('denies destinations outside the allow-list', () => {
    const policy = { allowedDestinations: ['rGOOD'] };
    expect(evaluatePolicy(policy, { destination: 'rEVIL' }).allowed).toBe(false);
    expect(evaluatePolicy(policy, { destination: 'rGOOD' }).allowed).toBe(true);
  });

  it('allows when no rules are configured', () => {
    expect(evaluatePolicy({}, { amount: '999999' }).allowed).toBe(true);
  });
});

describe('createToolGate', () => {
  const build = (maxPaymentXrp?: number, approve = vi.fn(async () => true)) => ({
    approve,
    gate: createToolGate({ policy: { maxPaymentXrp }, approve }),
  });

  it('passes read tools without asking for approval', async () => {
    const { gate, approve } = build();
    expect((await gate('get_balance', {})).allowed).toBe(true);
    expect((await gate('prepare_payment', { destination: 'rX', amount: '1' })).allowed).toBe(true);
    expect(approve).not.toHaveBeenCalled();
  });

  it('denies a submit above the policy cap before asking the human', async () => {
    const { gate, approve } = build(50);
    const decision = await gate(SUBMIT_PAYMENT_TOOL, {
      destination: 'rX',
      amount: '100',
    });
    expect(decision.allowed).toBe(false);
    expect(approve).not.toHaveBeenCalled();
  });

  it('asks for approval on an in-policy submit and allows when approved', async () => {
    const approve = vi.fn(async () => true);
    const { gate } = build(50, approve);
    const decision = await gate(SUBMIT_PAYMENT_TOOL, {
      destination: 'rX',
      amount: '10',
    });
    expect(approve).toHaveBeenCalledOnce();
    expect(decision.allowed).toBe(true);
  });

  it('denies the submit when the human declines', async () => {
    const { gate } = build(
      50,
      vi.fn(async () => false),
    );
    const decision = await gate(SUBMIT_PAYMENT_TOOL, {
      destination: 'rX',
      amount: '10',
    });
    expect(decision.allowed).toBe(false);
  });
});
