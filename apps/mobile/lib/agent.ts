import { XRPL_TESTNET, XrplAdapter } from '@flama/chain-xrpl';
import {
  type ApproveFn,
  DEFAULT_PERSONA,
  type Persona,
  type TransactionPolicy,
  WalletAgent,
  XrplWalletGateway,
} from '@flama/wallet-agent';
import { app } from './flama';

/**
 * On-device XRPL wallet agent wiring. The agent runs entirely on the phone: it
 * connects to Claude through the Anthropic SDK and signs through the device
 * keyring. The UI only needs to call {@link createWalletAgent} with an `approve`
 * callback and then drive `agent.ask(text)`.
 *
 * ⚠️ POC ONLY — the API key below ships inside the app bundle and is therefore
 * extractable. This is fine for a testnet proof-of-concept; before handling real
 * funds, move the Claude call behind a backend and keep the key server-side.
 */
const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? 'sk-ant-REPLACE_ME';

/** The chain the agent operates on. */
const XRPL_CHAIN_ID = 'xrpl:testnet';

/** Default hard policy: cap single payments. Tune per product. */
const DEFAULT_POLICY: TransactionPolicy = { maxPaymentXrp: 50 };

export interface CreateWalletAgentOptions {
  /**
   * Called when the agent wants to submit a payment. Wire this to your approval
   * UI (a confirmation sheet) and resolve true to sign + send, false to decline.
   */
  approve: ApproveFn;
  /** Override the personality (defaults to {@link DEFAULT_PERSONA}). */
  persona?: Persona;
  /** Override the hard policy rules. */
  policy?: TransactionPolicy;
  /** Override the Claude model id. */
  model?: string;
}

/**
 * Builds a {@link WalletAgent} bound to the active, unlocked wallet's XRPL
 * account. Throws if there is no XRPL account yet (create/import + unlock first).
 */
export function createWalletAgent(options: CreateWalletAgentOptions): WalletAgent {
  const account = app.wallet.store.getState().accounts.find((a) => a.chainId === XRPL_CHAIN_ID);
  if (!account) {
    throw new Error('No XRPL account available — create or import a wallet and unlock it first.');
  }

  const signer = app.wallet.getSigner(XRPL_CHAIN_ID);
  const gateway = new XrplWalletGateway(new XrplAdapter(XRPL_TESTNET), account.address, signer);

  return new WalletAgent({
    gateway,
    apiKey: ANTHROPIC_API_KEY,
    network: XRPL_TESTNET.name,
    symbol: XRPL_TESTNET.nativeCurrency.symbol,
    persona: options.persona ?? DEFAULT_PERSONA,
    policy: options.policy ?? DEFAULT_POLICY,
    approve: options.approve,
    model: options.model,
    // App-origin (no server) call to the Anthropic API.
    dangerouslyAllowBrowser: true,
  });
}
