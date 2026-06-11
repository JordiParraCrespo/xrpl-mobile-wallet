/** Converts a human-readable decimal string ("1.5") to base units. */
export function parseUnits(value: string, decimals: number): bigint {
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Invalid decimal amount: "${value}"`);
  }
  const [whole, fraction = ''] = trimmed.split('.');
  if (fraction.length > decimals) {
    throw new Error(`Amount "${value}" exceeds ${decimals} decimal places`);
  }
  const fractionPadded = fraction.padEnd(decimals, '0');
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fractionPadded || '0');
}

/** Converts base units to a human-readable decimal string. */
export function formatUnits(value: bigint, decimals: number): string {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = (value % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
