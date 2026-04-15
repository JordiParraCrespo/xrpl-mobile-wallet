export interface ErrorDefinition {
  readonly code: string;
  readonly message: string;
}

export class AppError extends Error {
  public readonly code: string;

  constructor(error: ErrorDefinition) {
    super(error.message);
    this.code = error.code;
    this.name = 'AppError';
  }
}
