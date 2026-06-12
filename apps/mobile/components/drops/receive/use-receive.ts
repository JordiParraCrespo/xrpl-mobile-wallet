import { useWalletState } from '@flama/frontend/react';
import * as Clipboard from 'expo-clipboard';
import * as React from 'react';
import { Share } from 'react-native';
import { type ReceiveAccount, toReceiveAccount } from './receive-data';

export type ReceiveStatus = 'idle' | 'no_wallet' | 'locked' | 'ready';

export type UseReceive = {
  /** The currently shown receiving account, or null when none is available. */
  account: ReceiveAccount | null;
  /** Number of receivable accounts (chains) on the active wallet. */
  accountCount: number;
  /** Wallet lifecycle status, so the screen can guard locked / empty states. */
  status: ReceiveStatus;
  copied: boolean;
  cycle: () => void;
  copy: () => void;
  share: () => void;
};

/**
 * Connects the Receive screen to the wallet domain: the receiving accounts are
 * the active wallet's per-chain accounts (`useWalletState().accounts`), mapped
 * onto the presentational `ReceiveAccount`. Cycling swaps the QR, address and
 * network together. Copy writes the address to the clipboard (confirmed
 * visually); share opens the native share sheet.
 */
export function useReceive(): UseReceive {
  const { status, accounts } = useWalletState();
  const [index, setIndex] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const receiveAccounts = React.useMemo(() => accounts.map(toReceiveAccount), [accounts]);

  const account =
    receiveAccounts.length > 0 ? receiveAccounts[index % receiveAccounts.length] : null;

  const cycle = React.useCallback(() => {
    setIndex((i) => i + 1);
    setCopied(false);
  }, []);

  const copy = React.useCallback(() => {
    if (!account) return;
    Clipboard.setStringAsync(account.address).catch(() => {
      // Best-effort; the visual confirmation still reflects the intent.
    });
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }, [account]);

  const share = React.useCallback(() => {
    if (!account) return;
    Share.share({ message: account.address }).catch(() => {
      // Sharing is best-effort; a dismissed sheet is not an error.
    });
  }, [account]);

  return {
    account,
    accountCount: receiveAccounts.length,
    status,
    copied,
    cycle,
    copy,
    share,
  };
}
