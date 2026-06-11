/**
 * Interactive XRPL wallet agent demo — requires a Claude API key.
 *
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   pnpm demo:agent
 *
 * Spins up a throwaway, faucet-funded testnet wallet and drops you into a chat
 * with the agent. Try: "what's my balance?", "what's the latest ledger?",
 * "send 1 XRP to <address> tag 42". Payments require your y/N approval in the
 * terminal and are capped by policy. Personality is loaded from a markdown file
 * (scripts/persona.example.md or $PERSONA_FILE) — edit it to change the agent.
 */
import { existsSync, readFileSync } from 'node:fs';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { XRPL_TESTNET, XrplAdapter } from '@flama/chain-xrpl';
import {
  DEFAULT_PERSONA,
  type Persona,
  personaFromMarkdown,
  WalletAgent,
  XrplWalletGateway,
} from '@flama/wallet-agent';
import { KeyringManager, type SecureStorage } from '@flama/wallet-keyring';

function memoryStorage(): SecureStorage {
  const data = new Map<string, string>();
  return {
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => {
      data.set(key, value);
    },
    remove: async (key) => {
      data.delete(key);
    },
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fund(adapter: XrplAdapter, address: string): Promise<void> {
  await adapter.requestFaucet(address);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await sleep(2000);
    if ((await adapter.getBalance(address)).amount > 0n) {
      return;
    }
  }
  throw new Error('Faucet funding timed out');
}

function loadPersona(): Persona {
  const path = process.env.PERSONA_FILE ?? 'scripts/persona.example.md';
  return existsSync(path) ? personaFromMarkdown(readFileSync(path, 'utf8')) : DEFAULT_PERSONA;
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Set ANTHROPIC_API_KEY to run the agent demo.');
    process.exit(1);
  }

  const adapter = new XrplAdapter(XRPL_TESTNET);
  const keyring = new KeyringManager(memoryStorage(), { n: 1024, r: 8, p: 1 });
  await keyring.initialize('demo-passcode');
  const wallet = await keyring.createWallet({ name: 'Agent wallet' });
  const signer = keyring.getSigner(wallet.id, 'xrpl');
  const address = adapter.deriveAddress(signer.publicKey);

  console.log(`Wallet: ${address}`);
  console.log('Funding from the testnet faucet (~10s)…');
  await fund(adapter, address);

  const persona = loadPersona();
  const rl = createInterface({ input: stdin, output: stdout });

  const gateway = new XrplWalletGateway(adapter, address, signer);
  const agent = new WalletAgent({
    gateway,
    network: XRPL_TESTNET.name,
    symbol: XRPL_TESTNET.nativeCurrency.symbol,
    persona,
    policy: { maxPaymentXrp: 50 },
    model: process.env.MODEL,
    approve: async ({ input }) => {
      const answer = await rl.question(
        `\n⚠️  Approve this transaction?\n   ${JSON.stringify(input)}\n   (y/N) `,
      );
      return answer.trim().toLowerCase() === 'y';
    },
  });

  console.log(
    `\n${persona.name} is ready. Try: "what's my balance?", "what's the latest ledger?",`,
  );
  console.log(`"send 1 XRP to <address> tag 42". Type "exit" to quit.\n`);

  for (;;) {
    const message = await rl.question('you › ');
    const trimmed = message.trim();
    if (!trimmed || trimmed === 'exit') {
      break;
    }
    try {
      const reply = await agent.ask(trimmed);
      console.log(`\n${persona.name} › ${reply}\n`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
    }
  }
  rl.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
