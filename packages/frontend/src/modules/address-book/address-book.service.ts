import { inject, injectable } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { AppError } from '../core/errors';
import type { IStorageService } from '../core/storage.service';
import { AddressBookErrors } from './address-book.errors';
import type { AddressBookStore, Contact, ContactKind } from './address-book.state';

/** Device-storage key for the serialized contact list. */
const CONTACTS_STORAGE_KEY = 'flama.addressBook.contacts';

/** A name must be at least this many characters to be accepted. */
export const MIN_CONTACT_NAME_LENGTH = 2;
/** Names are clipped to this length before being persisted. */
export const MAX_CONTACT_NAME_LENGTH = 40;

export interface AddContactInput {
  name: string;
  address: string;
  kind?: ContactKind;
  chainId: string;
  destinationTag?: string;
}

/**
 * Owns the **address book** — the user's saved payment recipients, kept on the
 * device. It maps chain addresses back to human names so the payments screen
 * can frame sending money as messaging a person rather than a wallet. It holds
 * no key material and is independent of the wallet vault.
 *
 * This module is strictly about *who* you pay; the transactions themselves come
 * from the `explorer` module. Joining the two (resolving a transaction's
 * counterparty to a saved name) is this module's pure {@link buildPaymentsFeed}.
 */
@injectable()
export class AddressBookService {
  constructor(
    @inject(TOKENS.StorageService)
    private readonly storage: IStorageService,
    @inject(TOKENS.AddressBookStore)
    public readonly store: AddressBookStore,
  ) {}

  /** Loads the persisted contacts into the store. */
  async restore(): Promise<void> {
    const contacts = await this.read();
    this.store.setState({ status: 'ready', contacts });
  }

  /** Validates, de-duplicates and persists a new contact. Returns it. */
  async addContact(input: AddContactInput): Promise<Contact> {
    const name = (input.name ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_CONTACT_NAME_LENGTH);
    if (name.length < MIN_CONTACT_NAME_LENGTH) {
      throw new AppError(AddressBookErrors.INVALID_NAME);
    }
    const address = (input.address ?? '').trim();
    if (!address) {
      throw new AppError(AddressBookErrors.INVALID_ADDRESS);
    }

    const contacts = await this.read();
    const duplicate = contacts.some(
      (c) => c.chainId === input.chainId && c.address.toLowerCase() === address.toLowerCase(),
    );
    if (duplicate) {
      throw new AppError(AddressBookErrors.DUPLICATE_CONTACT);
    }

    const contact: Contact = {
      id: cryptoRandomId(),
      name,
      kind: input.kind ?? 'individual',
      chainId: input.chainId,
      address,
      destinationTag: input.destinationTag?.trim() || undefined,
      createdAt: Date.now(),
    };

    const next = [contact, ...contacts];
    await this.write(next);
    return contact;
  }

  /** Removes a contact by id. */
  async removeContact(id: string): Promise<void> {
    const contacts = await this.read();
    await this.write(contacts.filter((c) => c.id !== id));
  }

  /** Forgets every saved contact (e.g. when wiping the device). */
  async clear(): Promise<void> {
    await this.storage.remove(CONTACTS_STORAGE_KEY);
    this.store.setState({ contacts: [] });
  }

  /** Reads + parses the stored contacts, newest first. */
  private async read(): Promise<Contact[]> {
    const raw = await this.storage.get(CONTACTS_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as Contact[];
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      // Corrupt payload: start clean rather than crash the screen.
      return [];
    }
  }

  /** Persists and publishes the contact list (newest first). */
  private async write(contacts: Contact[]): Promise<void> {
    const ordered = [...contacts].sort((a, b) => b.createdAt - a.createdAt);
    await this.storage.set(CONTACTS_STORAGE_KEY, JSON.stringify(ordered));
    this.store.setState({ status: 'ready', contacts: ordered });
  }
}

/** Best-effort unique id without pulling in a uuid dependency. */
function cryptoRandomId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
