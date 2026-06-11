import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { formatUnits } from '@flama/chain-core';
import { paymentInputSchema } from '@flama/shared';
import { PaymentTransaction, type TxSummary } from '@flama/wallet-xrpl-tx';
import { z } from 'zod';
import type { WalletGateway } from './gateway';

/** MCP server name; tools are exposed to the model as `mcp__wallet__<tool>`. */
export const WALLET_SERVER_NAME = 'wallet';

const ok = (text: string) => ({ content: [{ type: 'text' as const, text }] });
const fail = (text: string) => ({
  content: [{ type: 'text' as const, text }],
  isError: true,
});

const issueList = (issues: { field?: string; message: string }[]): string =>
  issues.map((i) => `- ${i.field ? `${i.field}: ` : ''}${i.message}`).join('\n');

const summaryText = (summary: TxSummary): string =>
  summary.lines.map((line) => `${line.label}: ${line.value}`).join('\n');

/**
 * Builds the in-process MCP server exposing the wallet's tools. Read tools wrap
 * the gateway; `prepare_payment` validates and shows a summary without sending;
 * `submit_payment` re-validates, signs, and broadcasts — but only after the
 * `canUseTool` gate (policy + human approval) has allowed it.
 */
export function createWalletTools(gateway: WalletGateway) {
  const payment = new PaymentTransaction();

  const getBalance = tool('get_balance', "Get the wallet's current XRP balance.", {}, async () => {
    const balance = await gateway.getBalance();
    return ok(`${balance.formatted} ${balance.symbol}`);
  });

  const getRecentBlocks = tool(
    'get_recent_blocks',
    'Get the most recently validated ledgers (the current "block" is the first), newest first.',
    { limit: z.number().int().min(1).max(20).optional() },
    async ({ limit }) => {
      const blocks = await gateway.getRecentBlocks(limit ?? 5);
      const lines = blocks.map(
        (b) =>
          `ledger #${b.height} — ${b.transactionCount} txns — ${new Date(b.timestamp * 1000).toISOString()}`,
      );
      return ok(lines.join('\n'));
    },
  );

  const preparePayment = tool(
    'prepare_payment',
    'Validate and prepare an XRP payment WITHOUT sending it. Returns a summary to show the ' +
      'user for confirmation. Always call this before submit_payment.',
    paymentInputSchema.shape,
    async (args) => {
      const ctx = await gateway.buildContext();
      const result = payment.prepare(args, ctx);
      if (!result.ok) {
        return fail(`This payment cannot be prepared:\n${issueList(result.issues)}`);
      }
      return ok(
        `Prepared (NOT yet sent). Show this to the user and ask them to confirm before ` +
          `calling submit_payment with the same arguments:\n${summaryText(result.summary)}`,
      );
    },
  );

  const submitPayment = tool(
    'submit_payment',
    'Submit an XRP payment the user has approved. Re-validates, signs, and broadcasts it. ' +
      'Only call this after the user has explicitly confirmed a prepared payment.',
    paymentInputSchema.shape,
    async (args) => {
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
  );

  return createSdkMcpServer({
    name: WALLET_SERVER_NAME,
    tools: [getBalance, getRecentBlocks, preparePayment, submitPayment],
  });
}
