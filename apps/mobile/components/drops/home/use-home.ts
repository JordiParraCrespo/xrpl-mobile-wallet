import { useChainBalances, useMarkets, useWalletState } from '@flama/frontend/react';
import * as React from 'react';
import { badgeForChainKind, type HomeAccount, totalUsd } from './home-data';

export type HomeStatus = 'idle' | 'no_wallet' | 'locked' | 'ready';

export type UseHome = {
  /** Active wallet's display name (the balance-hero switcher label). */
  walletName: string;
  /** Wallet lifecycle status, so the screen can guard locked / empty states. */
  status: HomeStatus;
  /** One view model per chain account on the active wallet, with USD value. */
  accounts: HomeAccount[];
  /** Sum of every account's USD value — the balance hero figure. */
  totalUsd: number;
  /** True while balances or prices are still loading for the first time. */
  isLoading: boolean;
  /** True when a balance could not be fetched. */
  isError: boolean;
};

/**
 * Connects the Home screen to the wallet + prices domains. The accounts are the
 * active wallet's per-chain accounts (`useWalletState().accounts`); each one's
 * native balance comes from `useChainBalances` and its USD value from live
 * `useMarkets` prices (CoinGecko, free, no API key). Everything is converted to
 * USD so the hero and tiles are fiat-first.
 */
export function useHome(): UseHome {
  const { status, accounts, wallets, activeWalletId } = useWalletState();

  const chainIds = React.useMemo(() => accounts.map((a) => a.chainId), [accounts]);
  const balances = useChainBalances(chainIds);

  const symbols = React.useMemo(() => [...new Set(accounts.map((a) => a.symbol))], [accounts]);
  const { data: markets } = useMarkets(symbols, 'usd', {
    enabled: symbols.length > 0,
  });

  const priceBySymbol = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const market of markets ?? []) {
      map.set(market.symbol, market.price);
    }
    return map;
  }, [markets]);

  // `balances` is index-aligned with `accounts` (same order as `chainIds`).
  const views = React.useMemo<HomeAccount[]>(() => {
    return accounts.map((account, index) => {
      const balance = balances[index]?.data;
      const amount = balance ? Number(balance.formatted) : 0;
      const price = priceBySymbol.get(account.symbol) ?? 0;
      return {
        id: account.chainId,
        name: account.chainName,
        amount,
        unit: account.symbol,
        usd: amount * price,
        badge: badgeForChainKind(account.kind),
      };
    });
  }, [accounts, balances, priceBySymbol]);

  const walletName = wallets.find((w) => w.id === activeWalletId)?.name ?? wallets[0]?.name ?? '';

  const pricesLoading = symbols.length > 0 && markets === undefined;
  const isLoading = balances.some((b) => b.isLoading) || pricesLoading;
  const isError = balances.some((b) => b.isError);

  return {
    walletName,
    status,
    accounts: views,
    totalUsd: totalUsd(views),
    isLoading,
    isError,
  };
}
