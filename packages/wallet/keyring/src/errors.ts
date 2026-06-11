export class InvalidMnemonicError extends Error {
  constructor() {
    super('Invalid mnemonic phrase');
    this.name = 'InvalidMnemonicError';
  }
}

export class InvalidPasscodeError extends Error {
  constructor() {
    super('Invalid passcode');
    this.name = 'InvalidPasscodeError';
  }
}

export class KeyringLockedError extends Error {
  constructor() {
    super('Keyring is locked');
    this.name = 'KeyringLockedError';
  }
}

export class UnsupportedChainError extends Error {
  constructor(message = 'Unsupported chain for this wallet') {
    super(message);
    this.name = 'UnsupportedChainError';
  }
}

export class VaultCorruptedError extends Error {
  constructor(message = 'Vault data is corrupted') {
    super(message);
    this.name = 'VaultCorruptedError';
  }
}

export class WalletNotFoundError extends Error {
  constructor(walletId: string) {
    super(`Wallet "${walletId}" not found`);
    this.name = 'WalletNotFoundError';
  }
}
