import { wordlist } from "@scure/bip39/wordlists/english";

const WORDS = new Set<string>(wordlist);

/**
 * Whether `word` belongs to the BIP-39 English wordlist. UI-level helper
 * for flagging individual words while a phrase is being typed — whole-phrase
 * validation (incl. checksum) still happens on import.
 */
export function isValidMnemonicWord(word: string): boolean {
  return WORDS.has(word.trim().toLowerCase());
}
