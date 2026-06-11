import { bytesToHex } from '@noble/hashes/utils';

/** A single XRPL Memo wrapper as it appears in a transaction's `Memos` array. */
export interface XrplMemo {
  Memo: {
    /** UTF-8 memo text, hex-encoded and upper-cased per the XRPL wire format. */
    MemoData: string;
  };
}

/** Encodes free-text memo content into the XRPL `Memos` entry shape. */
export function encodeMemo(text: string): XrplMemo {
  const data = bytesToHex(new TextEncoder().encode(text)).toUpperCase();
  return { Memo: { MemoData: data } };
}
