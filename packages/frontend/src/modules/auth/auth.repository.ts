import type { AuthClient } from "@flama/api-client/auth";
import type { LoginDto, RegisterDto, TokenPair } from "@flama/shared";
import { inject, injectable } from "inversify";
import { TOKENS } from "../../di/tokens";
import { AppError } from "../core/errors";
import { UserEntity } from "../users/user.entity";
import type { IStorageService } from "../core/storage.service";
import { AuthErrors } from "./auth.errors";

@injectable()
export class AuthRepository {
  constructor(
    @inject(TOKENS.AuthClient) private readonly authClient: AuthClient,
    @inject(TOKENS.StorageService) private readonly storage: IStorageService
  ) {}

  async login(dto: LoginDto): Promise<TokenPair> {
    const { data } = await this.authClient.POST("/api/v1/auth/login", {
      body: dto,
    });
    if (!data) throw new AppError(AuthErrors.LOGIN_FAILED);
    await this.storage.set("accessToken", data.accessToken);
    await this.storage.set("refreshToken", data.refreshToken);
    return data;
  }

  async register(dto: RegisterDto): Promise<TokenPair> {
    const { data } = await this.authClient.POST("/api/v1/auth/register", {
      body: dto,
    });
    if (!data) throw new AppError(AuthErrors.REGISTER_FAILED);
    await this.storage.set("accessToken", data.accessToken);
    await this.storage.set("refreshToken", data.refreshToken);
    return data;
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const { data } = await this.authClient.POST("/api/v1/auth/refresh", {
      body: { refreshToken },
    });
    if (!data) throw new AppError(AuthErrors.REFRESH_FAILED);
    await this.storage.set("accessToken", data.accessToken);
    await this.storage.set("refreshToken", data.refreshToken);
    return data;
  }

  async forgotPassword(email: string): Promise<void> {
    await this.authClient.POST("/api/v1/auth/forgot-password", {
      body: { email },
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await this.authClient.POST("/api/v1/auth/reset-password", {
      body: { token, password },
    });
  }

  async getProfile(): Promise<UserEntity> {
    const { data } = await this.authClient.GET("/api/v1/auth/profile");
    if (!data) throw new AppError(AuthErrors.PROFILE_FAILED);
    return new UserEntity(
      data.id,
      data.email,
      data.firstName,
      data.lastName,
      data.role,
      data.provider,
      data.isActive,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }

  async logout(): Promise<void> {
    await this.storage.remove("accessToken");
    await this.storage.remove("refreshToken");
  }
}
