/**
 * A payment target parsed from a scanned QR payload: the bare destination
 * address plus an optional XRPL destination tag.
 */
export type PaymentTarget = {
  address: string;
  destinationTag?: string;
};

// Schemes a payment QR might carry. Our own Receive QR encodes a bare address,
// but exchanges and other wallets often wrap it in a URI (`xrpl:r…?dt=123`,
// `ethereum:0x…`). We strip the scheme and read the address off the front.
const SCHEME = /^(xrpl|ripple|xrp|ethereum):\/{0,2}/i;

// Query keys that carry an XRPL destination tag across the common URI dialects.
const TAG_KEYS = new Set(['dt', 'destinationtag', 'dest_tag']);

/**
 * Parse a scanned QR payload into a {@link PaymentTarget}.
 *
 * Returns `null` when the payload has no address body at all; callers treat
 * that as an unrecognized code. Address validity for the paying chain is left
 * to the wallet domain (`wallet.isValidAddress`) — this only extracts the
 * candidate address and tag, it does not vouch for them.
 */
export function parsePaymentTarget(raw: string): PaymentTarget | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withoutScheme = trimmed.replace(SCHEME, '');
  const [addressPart, queryPart] = withoutScheme.split('?');
  const address = addressPart.trim();
  if (!address) return null;

  let destinationTag: string | undefined;
  if (queryPart) {
    for (const pair of queryPart.split('&')) {
      const [key, value] = pair.split('=');
      if (key && value && TAG_KEYS.has(key.toLowerCase()) && /^\d+$/.test(value)) {
        destinationTag = value;
        break;
      }
    }
  }

  return { address, destinationTag };
}
