import { describe, expect, it, vi } from 'vitest';
import { WalletAgent } from './agent';
import type { WalletGateway } from './gateway';
import type { ContentBlock, CreateMessageResponse, MessagesClient } from './messages';

const baseGateway: WalletGateway = {
  address: 'rSENDER',
  explorerUrl: 'https://testnet.xrpl.org',
  getBalance: async () => ({
    symbol: 'XRP',
    decimals: 6,
    amount: 100_000_000n,
    formatted: '100',
  }),
  getRecentBlocks: async () => [],
  buildContext: async () => ({
    account: 'rSENDER',
    sequence: 1,
    ledgerIndex: 1000,
    balanceDrops: 100_000_000n,
    reserveDrops: 1_000_000n,
    feeDrops: 12n,
  }),
  signAndSubmit: async () => ({ hash: 'ABC', success: true }),
};

/** A fake Claude connection that returns the given responses in sequence. */
function fakeClient(responses: CreateMessageResponse[]): MessagesClient {
  let call = 0;
  return {
    create: async () => responses[Math.min(call++, responses.length - 1)],
  };
}

const toolUseTurn = (name: string, input: Record<string, unknown>): CreateMessageResponse => ({
  stop_reason: 'tool_use',
  content: [{ type: 'tool_use', id: 'tu1', name, input }] as ContentBlock[],
});
const textTurn = (text: string): CreateMessageResponse => ({
  stop_reason: 'end_turn',
  content: [{ type: 'text', text }] as ContentBlock[],
});

const makeAgent = (
  client: MessagesClient,
  extra: Partial<Parameters<typeof WalletAgent>[0]> = {},
  gateway: WalletGateway = baseGateway,
) =>
  new WalletAgent({
    gateway,
    apiKey: 'test',
    network: 'XRPL Testnet',
    symbol: 'XRP',
    approve: async () => true,
    client,
    ...extra,
  });

describe('WalletAgent', () => {
  it('runs the tool loop: calls a read tool, then replies', async () => {
    const agent = makeAgent(
      fakeClient([toolUseTurn('get_balance', {}), textTurn('You have 100 XRP.')]),
    );
    expect(await agent.ask("what's my balance?")).toBe('You have 100 XRP.');
  });

  it('does not submit a payment when the human declines approval', async () => {
    const signAndSubmit = vi.fn(async () => ({ hash: 'ABC', success: true }));
    const agent = makeAgent(
      fakeClient([
        toolUseTurn('submit_payment', { destination: 'rDEST', amount: '1' }),
        textTurn('Okay, cancelled.'),
      ]),
      { approve: async () => false },
      { ...baseGateway, signAndSubmit },
    );

    const reply = await agent.ask('send 1 XRP to rDEST');
    expect(signAndSubmit).not.toHaveBeenCalled();
    expect(reply).toBe('Okay, cancelled.');
  });

  it('denies a payment over the policy cap without asking the human', async () => {
    const approve = vi.fn(async () => true);
    const signAndSubmit = vi.fn(async () => ({ hash: 'ABC', success: true }));
    const agent = makeAgent(
      fakeClient([
        toolUseTurn('submit_payment', { destination: 'rDEST', amount: '100' }),
        textTurn('That exceeds the limit.'),
      ]),
      { policy: { maxPaymentXrp: 50 }, approve },
      { ...baseGateway, signAndSubmit },
    );

    await agent.ask('send 100 XRP to rDEST');
    expect(approve).not.toHaveBeenCalled();
    expect(signAndSubmit).not.toHaveBeenCalled();
  });
});
