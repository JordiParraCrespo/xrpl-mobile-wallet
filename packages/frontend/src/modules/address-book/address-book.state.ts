import { createStore } from 'zustand/vanilla';

/** Whether a saved recipient is a person or an organisation. */
export type ContactKind = 'individual' | 'business';

/**
 * A saved recipient in the on-device address book. Holds just enough to
 * resolve a chain address back to a human name (and to pre-fill a send), and
 * never any key material — it is purely a local convenience.
 */
export interface Contact {
  /** Stable local id (not derived from the address, so it survives edits). */
  id: string;
  name: string;
  kind: ContactKind;
  /** Chain the address belongs to, e.g. "xrpl:testnet". */
  chainId: string;
  /** The recipient's classic address on `chainId`. */
  address: string;
  /** XRPL destination tag, when the recipient requires one. */
  destinationTag?: string;
  /** Creation time in unix milliseconds; used to order "newest first". */
  createdAt: number;
}

export interface AddressBookState {
  /** 'idle' until `restore()` has run. */
  status: 'idle' | 'ready';
  contacts: Contact[];
}

export type AddressBookStore = ReturnType<typeof createAddressBookStore>;

export const createAddressBookStore = () =>
  createStore<AddressBookState>(() => ({
    status: 'idle',
    contacts: [],
  }));
