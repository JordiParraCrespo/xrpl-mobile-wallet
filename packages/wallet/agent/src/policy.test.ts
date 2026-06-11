import { describe, expect, it, vi } from 'vitest';
import { createCanUseTool, evaluatePolicy } from './policy';

const SERVER = 'wallet';
const submit = `mcp__${SERVER}__submit_payment`;
const balance = `mcp__${SERVER}__get_balance`;

describe('evaluatePolicy', () => {
  it('denies a payment above the cap', () => {
    const decision = evaluatePolicy({ maxPaymentXrp: 50 }, { amount: '75' });
    expect(decision.allowed).toBe(false);
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

describe('createCanUseTool', () => {
  const build = (over: { maxPaymentXrp?: number } = {}, approve = vi.fn(async () => true)) => ({
    approve,
    canUseTool: createCanUseTool({ serverName: SERVER, policy: over, approve }),
  });

  it('auto-allows read tools without asking for approval', async () => {
    const { canUseTool, approve } = build();
    const decision = await canUseTool(balance, {});
    expect(decision.behavior).toBe('allow');
    expect(approve).not.toHaveBeenCalled();
  });

  it('denies any tool that is not a wallet tool (e.g. Bash)', async () => {
    const { canUseTool } = build();
    const decision = await canUseTool('Bash', { command: 'rm -rf /' });
    expect(decision.behavior).toBe('deny');
  });

  it('denies a submit above the policy cap before asking the human', async () => {
    const { canUseTool, approve } = build({ maxPaymentXrp: 50 });
    const decision = await canUseTool(submit, {
      destination: 'rX',
      amount: '100',
    });
    expect(decision.behavior).toBe('deny');
    expect(approve).not.toHaveBeenCalled();
  });

  it('asks for approval on an in-policy submit and allows when approved', async () => {
    const approve = vi.fn(async () => true);
    const { canUseTool } = build({ maxPaymentXrp: 50 }, approve);
    const decision = await canUseTool(submit, {
      destination: 'rX',
      amount: '10',
    });
    expect(approve).toHaveBeenCalledOnce();
    expect(decision.behavior).toBe('allow');
  });

  it('denies the submit when the human declines', async () => {
    const approve = vi.fn(async () => false);
    const { canUseTool } = build({ maxPaymentXrp: 50 }, approve);
    const decision = await canUseTool(submit, {
      destination: 'rX',
      amount: '10',
    });
    expect(decision.behavior).toBe('deny');
  });
});
