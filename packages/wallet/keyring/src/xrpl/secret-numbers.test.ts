import { bytesToHex } from '@noble/hashes/utils';
import { deriveKeypair, generateSeed } from 'ripple-keypairs';
import { describe, expect, it } from 'vitest';
import { createFamilySeedSigner } from './family-seed';
import {
  InvalidSecretNumbersError,
  isValidSecretNumbersRow,
  SECRET_NUMBERS_ROW_COUNT,
  SECRET_NUMBERS_ROW_LENGTH,
  secretNumbersToFamilySeed,
} from './secret-numbers';

function rowsFromEntropy(entropy: Uint8Array): string[] {
  const rows: string[] = [];
  for (let i = 0; i < SECRET_NUMBERS_ROW_COUNT; i++) {
    const value = (entropy[i * 2] << 8) | entropy[i * 2 + 1];
    const checksum = (value * (i * 2 + 1)) % 9;
    rows.push(`${String(value).padStart(5, '0')}${checksum}`);
  }
  return rows;
}

const ENTROPY = Uint8Array.from([
  0x01, 0x02, 0xff, 0xfe, 0x00, 0x00, 0xab, 0xcd, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
]);

describe('isValidSecretNumbersRow', () => {
  it('accepts rows with a correct checksum', () => {
    const rows = rowsFromEntropy(ENTROPY);
    rows.forEach((row, index) => {
      expect(row).toHaveLength(SECRET_NUMBERS_ROW_LENGTH);
      expect(isValidSecretNumbersRow(row, index)).toBe(true);
    });
  });

  it('rejects a wrong checksum', () => {
    const [row] = rowsFromEntropy(ENTROPY);
    const badChecksum = (Number(row[5]) + 1) % 10;
    expect(isValidSecretNumbersRow(`${row.slice(0, 5)}${badChecksum}`, 0)).toBe(false);
  });

  it('rejects a row validated at the wrong position', () => {
    const rows = rowsFromEntropy(ENTROPY);
    // Row 3 (value 0xabcd) checksum differs across positions.
    expect(isValidSecretNumbersRow(rows[3], 3)).toBe(true);
    expect(isValidSecretNumbersRow(rows[3], 4)).toBe(false);
  });

  it('rejects malformed rows', () => {
    expect(isValidSecretNumbersRow('12345', 0)).toBe(false);
    expect(isValidSecretNumbersRow('1234567', 0)).toBe(false);
    expect(isValidSecretNumbersRow('12a456', 0)).toBe(false);
    expect(isValidSecretNumbersRow('999990', 0)).toBe(false); // value > 65535
    expect(isValidSecretNumbersRow('', 0)).toBe(false);
  });
});

describe('secretNumbersToFamilySeed', () => {
  it('roundtrips entropy → rows → the same family seed', () => {
    const rows = rowsFromEntropy(ENTROPY);
    const seed = secretNumbersToFamilySeed(rows);
    expect(seed).toBe(generateSeed({ entropy: ENTROPY, algorithm: 'ecdsa-secp256k1' }));
  });

  it('derives a signer matching ripple-keypairs', () => {
    const rows = rowsFromEntropy(ENTROPY);
    const seed = secretNumbersToFamilySeed(rows);
    const signer = createFamilySeedSigner(seed);
    const keypair = deriveKeypair(generateSeed({ entropy: ENTROPY, algorithm: 'ecdsa-secp256k1' }));

    expect(signer.curve).toBe('secp256k1');
    expect(bytesToHex(signer.publicKey)).toBe(keypair.publicKey.toLowerCase());
  });

  it('tolerates surrounding whitespace per row', () => {
    const rows = rowsFromEntropy(ENTROPY).map((row) => ` ${row} `);
    expect(secretNumbersToFamilySeed(rows)).toBe(
      generateSeed({ entropy: ENTROPY, algorithm: 'ecdsa-secp256k1' }),
    );
  });

  it('throws on a wrong row count', () => {
    const rows = rowsFromEntropy(ENTROPY);
    expect(() => secretNumbersToFamilySeed(rows.slice(0, 7))).toThrow(InvalidSecretNumbersError);
    expect(() => secretNumbersToFamilySeed([])).toThrow(InvalidSecretNumbersError);
  });

  it('throws on an invalid row', () => {
    const rows = rowsFromEntropy(ENTROPY);
    rows[5] = '123456';
    expect(() => secretNumbersToFamilySeed(rows)).toThrow(InvalidSecretNumbersError);
  });
});
