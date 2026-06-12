import type { NotificationIcon } from '@flama/frontend';
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  type LucideIcon,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';

/**
 * Maps each semantic notification glyph from the domain to a concrete Lucide
 * icon. Keeping this in the app keeps the frontend package platform-agnostic
 * (it ships the semantic key, the app owns the icon set).
 */
export const NOTIFICATION_ICONS: Record<NotificationIcon, LucideIcon> = {
  received: ArrowDownLeft,
  swap: ArrowRightLeft,
  signin: ShieldCheck,
  sent: ArrowUpRight,
  price: TrendingUp,
  promo: Sparkles,
};
