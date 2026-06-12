/**
 * End-to-end XRPL payment demo — NO Claude API key required.
 *
 *   pnpm demo:payment
 *
 * Creates two throwaway testnet wallets, funds them from the faucet, reads the
 * balance and current ledger, prepares a payment with the transaction layer
 * (amount + destination tag + memo), then signs and submits that exact
 * transaction. Everything runs against the public XRPL testnet.
 */
import { XRPL_TESTNET, XrplAdapter } from '@flama/chain-xrpl';
import { KeyringManager, type SecureStorage } from '@flama/wallet-keyring';
import { PaymentTransaction } from '@flama/wallet-xrpl-tx';

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

/** Funds an address from the faucet and waits until the balance lands. */
async function fund(adapter: XrplAdapter, address: string): Promise<void> {
  await adapter.requestFaucet(address);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await sleep(2000);
    const balance = await adapter.getBalance(address);
    if (balance.amount > 0n) {
      return;
    }
  }
  throw new Error(`Faucet funding timed out for ${address}`);
}

async function main(): Promise<void> {
  const adapter = new XrplAdapter(XRPL_TESTNET);
  const keyring = new KeyringManager(memoryStorage(), { n: 1024, r: 8, p: 1 });
  await keyring.initialize('demo-passcode');

  const senderWallet = await keyring.createWallet({ name: 'Sender' });
  const receiverWallet = await keyring.createWallet({ name: 'Receiver' });
  const senderSigner = keyring.getSigner(senderWallet.id, 'xrpl');
  const receiver = adapter.deriveAddress(keyring.getSigner(receiverWallet.id, 'xrpl').publicKey);
  const sender = adapter.deriveAddress(senderSigner.publicKey);

  console.log('Sender  ', sender);
  console.log('Receiver', receiver);
  console.log('\nFunding both from the testnet faucet (this can take ~10s)…');
  await fund(adapter, sender);
  await fund(adapter, receiver);

  const balance = await adapter.getBalance(sender);
  const [latest] = await adapter.getRecentBlocks(1);
  console.log(`Sender balance: ${balance.formatted} XRP`);
  console.log(`Current ledger: #${latest.height} (${latest.transactionCount} txns)`);

  const ctx = await adapter.buildContext(sender);
  const result = new PaymentTransaction().prepare(
    {
      destination: receiver,
      amount: '1',
      destinationTag: 42,
      memo: 'flama demo',
    },
    ctx,
  );
  if (!result.ok) {
    console.error('\nValidation failed:', result.issues);
    process.exit(1);
  }

  console.log('\nPrepared payment (unsigned):');
  for (const line of result.summary.lines) {
    console.log(`  ${line.label}: ${line.value}`);
  }

  console.log('\nSigning + submitting the exact prepared transaction…');
  const tx = await adapter.signAndSubmit(result.tx, senderSigner);
  console.log(tx.success ? '\n✓ Confirmed on ledger' : `\n✗ Failed (${tx.code ?? tx.error})`);
  console.log('  hash:', tx.hash);
  if (tx.explorerUrl) {
    console.log('  explorer:', tx.explorerUrl);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
