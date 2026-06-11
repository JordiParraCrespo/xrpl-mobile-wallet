import { z } from 'zod';

/**
 * XRPL input schemas — the single source of truth for user/model-supplied
 * transaction fields. Reused by the agent tools, the `@flama/wallet-xrpl-tx`
 * transaction classes, and the mobile/web payment forms so all three enforce
 * identical rules.
 *
 * These are the first (shape/format) validation gate. They are deliberately
 * dependency-light: the classic-address check here is a cheap base58 shape
 * match for instant form feedback; the authoritative checksum check runs at
 * prepare time in the transaction class (which already depends on the XRPL
 * address codec). Domain checks (balance, reserve, self-payment) run later
 * against live chain state.
 */

/** XRP carries 6 decimal places; one XRP is 1,000,000 drops. */
export const XRP_DECIMALS = 6;
/** Destination tags are unsigned 32-bit integers. */
export const MAX_DESTINATION_TAG = 4_294_967_295;
/** Generous upper bound on a memo, in characters, well under the on-ledger cap. */
export const MAX_MEMO_LENGTH = 1000;

/**
 * Classic XRPL address shape: starts with `r`, base58 (Ripple alphabet),
 * 25–35 chars. Shape-only — the checksum is verified at prepare time.
 */
export const xrplAddressSchema = z
  .string()
  .regex(/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/, 'Invalid XRPL address');

/** Optional destination tag: an unsigned 32-bit integer. */
export const destinationTagSchema = z
  .number()
  .int('Destination tag must be a whole number')
  .min(0, 'Destination tag cannot be negative')
  .max(MAX_DESTINATION_TAG, 'Destination tag is out of range');

/**
 * Human-readable XRP amount as a decimal string (e.g. "1.5"), at most 6
 * decimal places and strictly greater than zero. Kept as a string to avoid
 * floating-point rounding; converted to drops via `parseUnits` downstream.
 */
export const xrpAmountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,6})?$/, 'Amount must be a number with up to 6 decimals')
  .refine((value) => Number(value) > 0, 'Amount must be greater than 0');

/** Free-text memo attached to a payment. */
export const memoSchema = z.string().max(MAX_MEMO_LENGTH, 'Memo is too long');

/** A payment as typed by the user / proposed by the agent. */
export const paymentInputSchema = z.object({
  destination: xrplAddressSchema,
  amount: xrpAmountSchema,
  destinationTag: destinationTagSchema.optional(),
  memo: memoSchema.optional(),
});

export type PaymentInput = z.infer<typeof paymentInputSchema>;
