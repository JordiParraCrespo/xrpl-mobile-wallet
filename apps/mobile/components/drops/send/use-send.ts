import { applyKeypadKey } from '@flama/design-system-mobile/keypad';
import {
  useChainBalance,
  useContacts,
  useExchangeRate,
  useFlamaApp,
  useSendTransaction,
  useWalletState,
} from '@flama/frontend/react';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  type SendAccount,
  type SendRecipient,
  toRecipient,
  toRecipientFromContact,
  toSendAccount,
} from './send-data';

export type SendStep = 'amount' | 'review' | 'sent';
export type SendStatus = 'idle' | 'no_wallet' | 'locked' | 'ready';

export type UseSend = {
  status: SendStatus;
  /** The paying account, or null while restoring / locked. */
  account: SendAccount | null;
  recipient: SendRecipient;
  /** The recipient's address is a well-formed destination on the paying chain. */
  recipientValid: boolean;
  step: SendStep;
  /** Raw USD amount string driven by the keypad ("0", "12", "12.50"). */
  amount: string;
  /** Numeric USD value of `amount`. */
  value: number;
  /** Equivalent XRP for `value` at the live rate, or null until the rate loads. */
  xrp: number | null;
  /** Spendable balance, in USD, or null until the rate loads. */
  usdBalance: number | null;
  note: string;
  /** Amount exceeds the spendable balance. */
  over: boolean;
  /** Amount + rate are valid and within balance (gates Continue). */
  canContinue: boolean;
  /** Everything Continue needs, plus a valid on-chain address and no in-flight send. */
  canSend: boolean;
  isSending: boolean;
  /** A failed broadcast, surfaced on the review step. */
  error: string | null;
  quickAmounts: number[];
  setNote: (note: string) => void;
  onKey: (key: string) => void;
  setQuickAmount: (usd: number) => void;
  toReview: () => void;
  toAmount: () => void;
  confirm: () => void;
  reset: () => void;
};

const QUICK_AMOUNTS = [10, 20, 50, 100];

/** The wallet AppError code for a malformed destination address. */
const INVALID_ADDRESS_CODE = 'WALLET_CLIENT_003';

/**
 * Connects the Send flow to the wallet + address-book + price domains.
 *
 * The recipient is resolved from the **address book** (`useContacts()`) by the
 * contact id the payment chat passes — a real saved `{ address, chainId,
 * destinationTag }` — falling back to an explicit address param or a demo peer.
 * The paying account is the wallet account on the recipient's chain
 * (`useWalletState().accounts`), so the broadcast settles on the right network;
 * its spendable balance and the XRP→USD rate come from the chain + price domains
 * so a dollar amount maps to a real XRP broadcast (`useSendTransaction`). The
 * destination is validated on-chain (`wallet.isValidAddress`) before Send is
 * enabled, and the step advances to "sent" only on a confirmed broadcast.
 */
export function useSend(): UseSend {
  const params = useLocalSearchParams<{
    contactId?: string;
    name?: string;
    handle?: string;
    address?: string;
  }>();
  const app = useFlamaApp();
  const { status, accounts, wallets, activeWalletId } = useWalletState();
  const contacts = useContacts();

  const recipient = React.useMemo<SendRecipient>(() => {
    // A saved contact is the real domain source: address + chain + tag.
    const saved = params.contactId ? contacts.find((c) => c.id === params.contactId) : undefined;
    if (saved) return toRecipientFromContact(saved, params.handle);
    return toRecipient({
      name: params.name,
      handle: params.handle,
      address: params.address,
    });
  }, [contacts, params.contactId, params.name, params.handle, params.address]);

  // Pay from the account on the recipient's chain; otherwise prefer the XRP
  // Ledger (this flow's home), else the first available account.
  const domainAccount = React.useMemo(() => {
    const onRecipientChain = recipient.chainId
      ? accounts.find((a) => a.chainId === recipient.chainId)
      : undefined;
    return onRecipientChain ?? accounts.find((a) => a.kind === 'xrpl') ?? accounts[0] ?? null;
  }, [accounts, recipient.chainId]);

  const walletName =
    wallets.find((w) => w.id === activeWalletId)?.name ?? domainAccount?.chainName ?? '';

  const account = React.useMemo(
    () => (domainAccount ? toSendAccount(domainAccount, walletName) : null),
    [domainAccount, walletName],
  );

  const balanceQuery = useChainBalance(account?.chainId ?? '', {
    enabled: !!account,
  });
  const rateQuery = useExchangeRate(account?.symbol ?? 'XRP', 'usd', {
    enabled: !!account,
  });
  const rate = rateQuery.data ?? null;

  const [step, setStep] = React.useState<SendStep>('amount');
  const [amount, setAmount] = React.useState('0');
  const [note, setNote] = React.useState('');

  const value = Number.parseFloat(amount) || 0;
  const xrp = rate && rate > 0 ? value / rate : null;
  const balanceXrp = balanceQuery.data ? Number.parseFloat(balanceQuery.data.formatted) : null;
  const usdBalance = rate != null && balanceXrp != null ? balanceXrp * rate : null;
  const over = usdBalance != null && value > usdBalance;

  // Validate the destination against the paying chain's adapter (XRPL classic
  // r-address, EVM 0x…) before allowing a broadcast — the same check `send`
  // enforces, surfaced up front so we never sign a doomed transaction.
  const recipientValid =
    !!account &&
    !!recipient.address &&
    app.wallet.isValidAddress(account.chainId, recipient.address);

  const send = useSendTransaction({ onSuccess: () => setStep('sent') });

  const canContinue = value > 0 && rate != null && !over;
  const canSend = canContinue && recipientValid && !send.isPending;

  const onKey = React.useCallback((key: string) => {
    setAmount((prev) => applyKeypadKey(prev, key));
  }, []);

  const setQuickAmount = React.useCallback((usd: number) => setAmount(String(usd)), []);
  const toReview = React.useCallback(() => setStep('review'), []);
  const toAmount = React.useCallback(() => setStep('amount'), []);

  const confirm = React.useCallback(() => {
    if (!account || !recipient.address || xrp == null) return;
    // toLocaleString would add thousands separators; the broadcast needs a bare
    // decimal, so round to XRP's precision and stringify the number.
    const xrpAmount = String(Number(xrp.toFixed(6)));
    send.mutate({
      chainId: account.chainId,
      to: recipient.address,
      amount: xrpAmount,
    });
  }, [account, recipient.address, xrp, send]);

  const reset = React.useCallback(() => {
    setStep('amount');
    setAmount('0');
    setNote('');
    send.reset();
  }, [send]);

  // Surface a malformed-address rejection distinctly from a generic failure.
  const error = send.isError
    ? (send.error as { code?: string } | null)?.code === INVALID_ADDRESS_CODE
      ? 'invalidAddress'
      : 'failed'
    : null;

  return {
    status,
    account,
    recipient,
    recipientValid,
    step,
    amount,
    value,
    xrp,
    usdBalance,
    note,
    over,
    canContinue,
    canSend,
    isSending: send.isPending,
    error,
    quickAmounts: QUICK_AMOUNTS,
    setNote,
    onKey,
    setQuickAmount,
    toReview,
    toAmount,
    confirm,
    reset,
  };
}
