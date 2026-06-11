import { generateSeed } from 'ripple-keypairs';

export const SECRET_NUMBERS_ROW_COUNT = 8;
export const SECRET_NUMBERS_ROW_LENGTH = 6;

export class InvalidSecretNumbersError extends Error {
  constructor(message = 'Invalid secret numbers') {
    super(message);
    this.name = 'InvalidSecretNumbersError';
  }
}

/**
 * Validates one Xaman secret-numbers row: five decimal digits encoding a
 * uint16 plus a checksum digit `(value * (rowIndex * 2 + 1)) % 9`.
 */
export function isValidSecretNumbersRow(row: string, index: number): boolean {
  if (index < 0 || index >= SECRET_NUMBERS_ROW_COUNT) return false;
  if (row.length !== SECRET_NUMBERS_ROW_LENGTH || !/^\d+$/.test(row)) return false;
  const value = Number(row.slice(0, 5));
  if (value > 0xffff) return false;
  return (value * (index * 2 + 1)) % 9 === Number(row[5]);
}

/**
 * Converts the 8 secret-numbers rows into the XRPL family seed Xaman
 * derives from them: 8 big-endian uint16s form 16 bytes of entropy, fed
 * into secp256k1 seed generation.
 */
export function secretNumbersToFamilySeed(rows: string[]): string {
  if (rows.length !== SECRET_NUMBERS_ROW_COUNT) {
    throw new InvalidSecretNumbersError(
      `Expected ${SECRET_NUMBERS_ROW_COUNT} rows, got ${rows.length}`,
    );
  }
  const entropy = new Uint8Array(SECRET_NUMBERS_ROW_COUNT * 2);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].trim();
    if (!isValidSecretNumbersRow(row, i)) {
      throw new InvalidSecretNumbersError(`Invalid secret numbers row ${i + 1}`);
    }
    const value = Number(row.slice(0, 5));
    entropy[i * 2] = value >> 8;
    entropy[i * 2 + 1] = value & 0xff;
  }
  return generateSeed({ entropy, algorithm: 'ecdsa-secp256k1' });
}
