import * as React from 'react';
import { Share } from 'react-native';
import { RECEIVE_ACCOUNTS } from './receive-data';

/**
 * Owns the Receive screen's interaction state: which account is shown, the
 * shared "copied" confirmation, and the cycle / copy / share actions. Cycling
 * the account swaps the QR, address, tag and network together.
 *
 * Clipboard wiring stays in app-land (no `expo-clipboard` dependency); copy
 * confirms visually like the design's `copied` state. Share uses the native
 * share sheet with the current address.
 */
export function useReceive() {
  const [index, setIndex] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const account = RECEIVE_ACCOUNTS[index];

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const cycle = React.useCallback(() => {
    setIndex((i) => (i + 1) % RECEIVE_ACCOUNTS.length);
    setCopied(false);
  }, []);

  const copy = React.useCallback(() => {
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }, []);

  const share = React.useCallback(() => {
    Share.share({ message: account.address }).catch(() => {
      // Sharing is best-effort; a dismissed sheet is not an error.
    });
  }, [account.address]);

  return { account, copied, cycle, copy, share };
}
