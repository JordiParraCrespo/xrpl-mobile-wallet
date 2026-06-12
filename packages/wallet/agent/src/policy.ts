import type { TxSummary } from '@flama/wallet-xrpl-tx';

/**
 * Hard policy rules, enforced in code outside the model. A prompt-injected or
 * jailbroken model can only ever *request* a payment; these rules (and the
 * human approval that follows) decide whether it happens. Mirrors Claude Code's
 * "deny rules checked first, overridable by nothing" guarantee.
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
  /** Ground-truth summary, when the tool produced one. */
  summary?: TxSummary;
}

/** Asks the human to approve a gated action. Returns true to proceed. */
export type ApproveFn = (request: ApprovalRequest) => Promise<boolean>;

/** Allow/deny result in the shape the Agent SDK's `canUseTool` expects. */
export type ToolDecision =
  | { behavior: 'allow'; updatedInput: Record<string, unknown> }
  | { behavior: 'deny'; message: string };

/** Function shape compatible with the Agent SDK `canUseTool` option. */
export type CanUseTool = (
  toolName: string,
  input: Record<string, unknown>,
) => Promise<ToolDecision>;

export interface CanUseToolConfig {
  /** The SDK MCP server name, used to namespace tool names. */
  serverName: string;
  policy: TransactionPolicy;
  approve: ApproveFn;
}

/**
 * Builds the layered `canUseTool` callback:
 *   default DENY → only known wallet tools pass → read tools auto-allow →
 *   the mutating `submit_payment` runs policy deny rules, then human approval.
 *
 * Default-deny means built-in tools (Bash, file access, ...) the SDK might offer
 * can never run: this agent has wallet tools and nothing else.
 */
export function createCanUseTool(config: CanUseToolConfig): CanUseTool {
  const tool = (name: string) => `mcp__${config.serverName}__${name}`;
  const submitTool = tool('submit_payment');
  const readTools = new Set([
    tool('get_balance'),
    tool('get_recent_blocks'),
    tool('prepare_payment'),
  ]);

  return async (toolName, input) => {
    if (toolName === submitTool) {
      const decision = evaluatePolicy(config.policy, input as PolicyInput);
      if (!decision.allowed) {
        return {
          behavior: 'deny',
          message: decision.reason ?? 'Denied by policy.',
        };
      }
      const approved = await config.approve({ tool: toolName, input });
      return approved
        ? { behavior: 'allow', updatedInput: input }
        : { behavior: 'deny', message: 'The user declined the transaction.' };
    }
    if (readTools.has(toolName)) {
      return { behavior: 'allow', updatedInput: input };
    }
    return {
      behavior: 'deny',
      message: 'This agent can only use its wallet tools.',
    };
  };
}
