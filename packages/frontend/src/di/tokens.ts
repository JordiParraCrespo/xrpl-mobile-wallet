export const TOKENS = {
  StorageService: Symbol.for("StorageService"),
  AuthClient: Symbol.for("AuthClient"),
  AuthRepository: Symbol.for("AuthRepository"),
  AuthStore: Symbol.for("AuthStore"),
  AuthService: Symbol.for("AuthService"),
  UsersClient: Symbol.for("UsersClient"),
  UserRepository: Symbol.for("UserRepository"),
  UsersStore: Symbol.for("UsersStore"),
  UsersService: Symbol.for("UsersService"),
} as const;
