import type { LoginDto, RegisterDto, TokenPair } from "@flama/shared";
import { defineAbilitiesFor } from "@flama/shared";
import { inject, injectable } from "inversify";
import { TOKENS } from "../../di/tokens";
import type { AuthRepository } from "./auth.repository";
import type { AuthStore } from "./auth.state";

@injectable()
export class AuthService {
  constructor(
    @inject(TOKENS.AuthRepository)
    private readonly authRepository: AuthRepository,
    @inject(TOKENS.AuthStore)
    public readonly store: AuthStore
  ) {}

  async login(dto: LoginDto): Promise<void> {
    await this.authRepository.login(dto);
    await this.loadProfile();
  }

  async register(dto: RegisterDto): Promise<void> {
    await this.authRepository.register(dto);
    await this.loadProfile();
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    return this.authRepository.refreshToken(refreshToken);
  }

  async forgotPassword(email: string): Promise<void> {
    return this.authRepository.forgotPassword(email);
  }

  async resetPassword(token: string, password: string): Promise<void> {
    return this.authRepository.resetPassword(token, password);
  }

  async loadProfile(): Promise<void> {
    try {
      const user = await this.authRepository.getProfile();
      const ability = defineAbilitiesFor(user.role);
      this.store.setState({
        user,
        ability,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      this.store.setState({
        user: null,
        ability: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }

  async logout(): Promise<void> {
    await this.authRepository.logout();
    this.store.setState({
      user: null,
      ability: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }
}
