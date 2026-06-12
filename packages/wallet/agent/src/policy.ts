import { SUBMIT_PAYMENT_TOOL } from './tools';

/**
 * Hard policy rules, enforced in code outside the model. A prompt-injected or
 * jailbroken model can only ever *request* a payment; these rules (and the human
 * approval that follows) decide whether it happens. Mirrors Claude Code's "deny
 * rules checked first, overridable by nothing" guarantee.
 */
export interface TransactionPolicy {
  /** Hard cap on a single payment, in XRP. Above this is denied outright. */
  maxPaymentXrp?: number;
  /** When set, only these destination addresses may receive payments. */
  allowedDestinations?: string[];
}

export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
}

/** Inputs a policy inspects — a subset of the payment tool arguments. */
export interface PolicyInput {
  destination?: unknown;
  amount?: unknown;
}

/** Evaluates the hard deny rules for a payment. Pure and unit-testable. */
export function evaluatePolicy(policy: TransactionPolicy, input: PolicyInput): PolicyDecision {
  const amount = typeof input.amount === 'string' ? Number(input.amount) : undefined;
  if (policy.maxPaymentXrp !== undefined && amount !== undefined && amount > policy.maxPaymentXrp) {
    return {
      allowed: false,
      reason: `Payments are capped at ${policy.maxPaymentXrp} XRP by policy; this one is ${amount}.`,
    };
  }
  if (
    policy.allowedDestinations &&
    typeof input.destination === 'string' &&
    !policy.allowedDestinations.includes(input.destination)
  ) {
    return {
      allowed: false,
      reason: 'The destination is not in the allow-list.',
    };
  }
  return { allowed: true };
}

/** A pending mutating action surfaced to the human for approval. */
export interface ApprovalRequest {
  tool: string;
  input: Record<string, unknown>;
}

/** Asks the human to approve a gated action. Returns true to proceed. */
export type ApproveFn = (request: ApprovalRequest) => Promise<boolean>;

/** Allow/deny result the agent loop uses before executing a tool. */
export interface GateDecision {
  allowed: boolean;
  message?: string;
}

/** Decides whether a tool call may execute. */
export type ToolGate = (toolName: string, input: Record<string, unknown>) => Promise<GateDecision>;

export interface ToolGateConfig {
  policy: TransactionPolicy;
  approve: ApproveFn;
}

/**
 * Builds the gate the agent loop runs before executing a tool. Read tools and
 * `prepare_payment` pass freely; the mutating `submit_payment` must clear the
 * hard policy deny rules and then human approval. The model cannot bypass this.
 */
export function createToolGate(config: ToolGateConfig): ToolGate {
  return async (toolName, input) => {
    if (toolName !== SUBMIT_PAYMENT_TOOL) {
      return { allowed: true };
    }
    const decision = evaluatePolicy(config.policy, input as PolicyInput);
    if (!decision.allowed) {
      return {
        allowed: false,
        message: decision.reason ?? 'Denied by policy.',
      };
    }
    const approved = await config.approve({ tool: toolName, input });
    return approved
      ? { allowed: true }
      : { allowed: false, message: 'The user declined the transaction.' };
  };
}
