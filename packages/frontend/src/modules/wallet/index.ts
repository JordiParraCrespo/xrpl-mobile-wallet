// Client-side input validation, re-exported so app screens never depend on
// the keyring package directly.
export {
  isValidFamilySeed,
  isValidMnemonicWord,
  isValidSecretNumbersRow,
  SECRET_NUMBERS_ROW_COUNT,
  SECRET_NUMBERS_ROW_LENGTH,
} from "@flama/wallet-keyring";
export { WalletErrors } from "./wallet.errors";
export { WalletModule } from "./wallet.module";
export { WalletService } from "./wallet.service";
export {
  createWalletStore,
  type WalletAccount,
  type WalletInfo,
  type WalletState,
  type WalletStore,
} from "./wallet.state";
