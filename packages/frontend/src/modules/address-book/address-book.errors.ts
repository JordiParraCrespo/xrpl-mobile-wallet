import type { ErrorDefinition } from '../core/errors';

export const AddressBookErrors = {
  INVALID_NAME: {
    code: 'ADDRESS_BOOK_CLIENT_001',
    message: 'Enter a name with at least 2 characters',
  },
  INVALID_ADDRESS: {
    code: 'ADDRESS_BOOK_CLIENT_002',
    message: 'Enter a valid recipient address',
  },
  DUPLICATE_CONTACT: {
    code: 'ADDRESS_BOOK_CLIENT_003',
    message: 'A contact with this address already exists',
  },
} as const satisfies Record<string, ErrorDefinition>;
