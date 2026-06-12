import type { WalletNotification } from './notification.types';

/**
 * Mock notification feed — stand-in for the server feed until a backend exists.
 * Mirrors the home-panel sample data from the Drops design (home.html).
 */
export const MOCK_NOTIFICATIONS: readonly WalletNotification[] = [
  {
    id: '1',
    group: 'today',
    icon: 'received',
    tone: 'positive',
    title: 'Received 60 XRP',
    body: 'From Maria Gutiérrez · ≈ $37.10',
    time: '2h',
    unread: true,
  },
  {
    id: '2',
    group: 'today',
    icon: 'swap',
    tone: 'brand',
    title: 'Swap completed',
    body: '100 XRP → 61.79 RLUSD',
    time: '3h',
    unread: true,
  },
  {
    id: '3',
    group: 'today',
    icon: 'signin',
    tone: 'warning',
    title: 'New sign-in',
    body: 'iPhone 15 · Barcelona, ES',
    time: '6h',
    unread: false,
  },
  {
    id: '4',
    group: 'earlier',
    icon: 'sent',
    tone: 'neutral',
    title: 'Payment settled',
    body: 'You sent 56.4 XRP to Aerolink Travel',
    time: 'Mon',
    unread: false,
  },
  {
    id: '5',
    group: 'earlier',
    icon: 'price',
    tone: 'info',
    title: 'XRP is up 2.4% today',
    body: 'Now ≈ $0.6184',
    time: 'Mon',
    unread: false,
  },
  {
    id: '6',
    group: 'earlier',
    icon: 'promo',
    tone: 'brand',
    title: 'DropPoints is coming',
    body: 'Earn rewards on every move — join the waitlist',
    time: 'Sun',
    unread: false,
  },
];
