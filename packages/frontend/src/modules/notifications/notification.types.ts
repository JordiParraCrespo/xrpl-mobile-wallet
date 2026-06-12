/**
 * Wallet notification feed — the model behind the home bell panel.
 *
 * For now the data is mocked in {@link ./notifications.data}; these types are
 * the contract a real backend feed will fill in later, so nothing downstream
 * has to change when the source becomes live.
 */

/** Semantic colour key for a notification's icon disc (maps to DS tones). */
export type NotificationTone = 'positive' | 'warning' | 'info' | 'brand' | 'neutral';

/** Semantic glyph key; the app maps each to a concrete icon. */
export type NotificationIcon = 'received' | 'swap' | 'signin' | 'sent' | 'price' | 'promo';

/** Recency bucket the row is grouped under in the panel. */
export type NotificationGroup = 'today' | 'earlier';

export interface WalletNotification {
  id: string;
  group: NotificationGroup;
  icon: NotificationIcon;
  tone: NotificationTone;
  title: string;
  body: string;
  /**
   * Short relative-time label for display (e.g. "2h", "Mon"). Mock data carries
   * the pre-formatted label; a live feed would carry a timestamp to format.
   */
  time: string;
  unread: boolean;
}
