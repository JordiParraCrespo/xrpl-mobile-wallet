import { formatUnits } from '@flama/chain-core';
import { PaymentTransaction, type TxSummary } from '@flama/wallet-xrpl-tx';
import type { WalletGateway } from './gateway';

/** A transport-agnostic tool: a JSON-Schema for the model plus a local handler. */
export interface WalletTool {
  name: string;
  description: string;
  /** JSON Schema describing the tool's arguments (shown to the model). */
  inputSchema: Record<string, unknown>;
  /** Executes the tool. Validation of `args` happens inside the handler. */
  run(args: Record<string, unknown>): Promise<ToolRunResult>;
}

export interface ToolRunResult {
  text: string;
  isError?: boolean;
}

/** Tool name of the single mutating action; gated by policy + human approval. */
export const SUBMIT_PAYMENT_TOOL = 'submit_payment';

const ok = (text: string): ToolRunResult => ({ text });
const fail = (text: string): ToolRunResult => ({ text, isError: true });

const issueList = (issues: { field?: string; message: string }[]): string =>
  issues.map((i) => `- ${i.field ? `${i.field}: ` : ''}${i.message}`).join('\n');

const summaryText = (summary: TxSummary): string =>
  summary.lines.map((line) => `${line.label}: ${line.value}`).join('\n');

/** JSON Schema for the payment tools, shared by prepare and submit. */
const paymentSchema: Record<string, unknown> = {
  type: 'object',
  properties: {
    destination: {
      type: 'string',
      description: 'Destination classic XRPL r-address.',
    },
    amount: {
      type: 'string',
      description: 'Amount of XRP as a decimal string, e.g. "1.5".',
    },
    destinationTag: {
      type: 'integer',
      minimum: 0,
      maximum: 4294967295,
      description: 'Optional destination tag (required by most exchanges).',
    },
    memo: { type: 'string', description: 'Optional free-text memo.' },
  },
  required: ['destination', 'amount'],
  additionalProperties: false,
};

/**
 * Builds the wallet's tools over a {@link WalletGateway}. Read tools wrap the
 * gateway; `prepare_payment` validates and summarizes without sending;
 * `submit_payment` re-validates, signs, and broadcasts — its execution is gated
 * upstream by the policy + approval check in the agent loop.
 */
export function createWalletTools(gateway: WalletGateway): WalletTool[] {
  const payment = new PaymentTransaction();

  return [
    {
      name: 'get_balance',
      description: "Get the wallet's current XRP balance.",
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      run: async () => {
        const balance = await gateway.getBalance();
        return ok(`${balance.formatted} ${balance.symbol}`);
      },
    },
    {
      name: 'get_recent_blocks',
      description:
        'Get the most recently validated ledgers (the current "block" is the first), newest first.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 20,
            description: 'How many ledgers.',
          },
        },
        additionalProperties: false,
      },
      run: async (args) => {
        const limit = typeof args.limit === 'number' ? args.limit : 5;
        const blocks = await gateway.getRecentBlocks(limit);
        const lines = blocks.map(
          (b) =>
            `ledger #${b.height} — ${b.transactionCount} txns — ${new Date(b.timestamp * 1000).toISOString()}`,
        );
        return ok(lines.join('\n'));
      },
    },
    {
      name: 'prepare_payment',
      description:
        'Validate and prepare an XRP payment WITHOUT sending it. Call this first, then ' +
        'submit_payment to actually send.',
      inputSchema: paymentSchema,
      run: async (args) => {
        const ctx = await gateway.buildContext();
        const result = payment.prepare(args, ctx);
        if (!result.ok) {
          return fail(`This payment cannot be prepared:\n${issueList(result.issues)}`);
        }
        return ok(
          `Validated and prepared (not yet sent):\n${summaryText(result.summary)}\n\n` +
            `Now call submit_payment with the same arguments to proceed. The user is shown ` +
            `an approval prompt to accept or decline before anything is signed — call ` +
            `submit_payment directly; do not ask the user to confirm in text.`,
        );
      },
    },
    {
      name: SUBMIT_PAYMENT_TOOL,
      description:
        'Submit an XRP payment the user has approved. Re-validates, signs, and broadcasts it. ' +
        'Only call this after the user has explicitly confirmed a prepared payment.',
      inputSchema: paymentSchema,
      run: async (args) => {
        const ctx = await gateway.buildContext();
        const result = payment.prepare(args, ctx);
        if (!result.ok) {
          return fail(`This payment cannot be submitted:\n${issueList(result.issues)}`);
        }
        const tx = await gateway.signAndSubmit(result.tx);
        if (!tx.success) {
          return fail(`Submission failed (${tx.code ?? tx.error ?? 'unknown error'}).`);
        }
        const explorer = tx.explorerUrl ? `\nExplorer: ${tx.explorerUrl}` : '';
        const total = formatUnits(result.summary.totalDebitDrops, 6);
        return ok(`Submitted ${total} XRP (incl. fee). Transaction hash: ${tx.hash}${explorer}`);
      },
    },
  ];
}
