export class InvalidMnemonicError extends Error {
  constructor() {
    super('Invalid mnemonic phrase');
    this.name = 'InvalidMnemonicError';
  }
}

export class WalletNotFoundError extends Error {
  constructor(walletId: string) {
    super(`Wallet "${walletId}" not found`);
    this.name = 'WalletNotFoundError';
  }
}
