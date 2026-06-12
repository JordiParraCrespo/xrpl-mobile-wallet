import { applyKeypadKey } from '@flama/design-system-mobile/keypad';
import {
  useChainBalance,
  useExchangeRate,
  useSendTransaction,
  useWalletState,
} from '@flama/frontend/react';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { type SendAccount, type SendRecipient, toRecipient, toSendAccount } from './send-data';

export type SendStep = 'amount' | 'review' | 'sent';
export type SendStatus = 'idle' | 'no_wallet' | 'locked' | 'ready';

export type UseSend = {
  status: SendStatus;
  /** The paying account, or null while restoring / locked. */
  account: SendAccount | null;
  recipient: SendRecipient;
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
  /** Everything Continue needs, plus a payable address and no in-flight send. */
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

/**
 * Connects the Send flow to the wallet domain. The paying account is the active
 * wallet's XRPL account (`useWalletState().accounts`); its spendable balance and
 * the XRP→USD rate come from the chain + price domains so the amount the user
 * types in dollars maps to a real XRP broadcast (`useSendTransaction`). The
 * recipient is read from the route (a payment chat), with a demo peer as the
 * walkable fallback. Step advances to "sent" only on a confirmed broadcast.
 */
export function useSend(): UseSend {
  const params = useLocalSearchParams<{
    name?: string;
    handle?: string;
    address?: string;
  }>();
  const { status, accounts, wallets, activeWalletId } = useWalletState();

  const recipient = React.useMemo(
    () =>
      toRecipient({
        name: params.name,
        handle: params.handle,
        address: params.address,
      }),
    [params.name, params.handle, params.address],
  );

  // Prefer the XRP Ledger account (this flow settles on XRPL), else the first.
  const domainAccount = React.useMemo(
    () => accounts.find((a) => a.kind === 'xrpl') ?? accounts[0] ?? null,
    [accounts],
  );

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

  const send = useSendTransaction({ onSuccess: () => setStep('sent') });

  const canContinue = value > 0 && rate != null && !over;
  const canSend = canContinue && !!recipient.address && !send.isPending;

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

  return {
    status,
    account,
    recipient,
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
    error: send.isError ? (send.error?.message ?? 'error') : null,
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
