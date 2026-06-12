// Compact relative date for payment rows, mirroring the Drops design:
// today → "Today", yesterday → "Yesterday", within a week → weekday
// ("Sun"), otherwise "12 Aug" (and "12 Aug 2024" once the year differs).
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_MS = 86_400_000;

/** @param timestamp Inclusion time in unix **seconds**. */
export function formatPaymentDate(timestamp: number, now: Date = new Date()): string {
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) return '';

  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(date)) / DAY_MS);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days > 1 && days < 7) return WEEKDAYS[date.getDay()];

  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  return date.getFullYear() === now.getFullYear()
    ? `${day} ${month}`
    : `${day} ${month} ${date.getFullYear()}`;
}

/**
 * Absolute date + time for the transaction detail, e.g. "12 Aug 2024 · 14:32".
 * Hand-rolled (no Intl) to match {@link formatPaymentDate}.
 *
 * @param timestamp Inclusion time in unix **seconds**.
 */
export function formatPaymentDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${date.getFullYear()} · ${hh}:${mm}`;
}
