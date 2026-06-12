import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { AddressBookService } from './address-book.service';
import { createAddressBookStore } from './address-book.state';

/**
 * Binds the address-book module: the on-device list of saved payment
 * recipients used to resolve transaction counterparties to human names on the
 * payments screen.
 */
export const AddressBookModule = new ContainerModule(({ bind }) => {
  bind(TOKENS.AddressBookStore).toConstantValue(createAddressBookStore());
  bind(TOKENS.AddressBookService).to(AddressBookService).inSingletonScope();
});
