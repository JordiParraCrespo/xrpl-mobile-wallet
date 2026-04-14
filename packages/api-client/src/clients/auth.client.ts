// Auto-generated — do not edit manually.
// Run `pnpm generate` to regenerate.

import createClient from "openapi-fetch";
import type { paths } from "../generated/api";
import type { AuthResponseDto } from "../models";

type AuthPaths = {
  [K in keyof paths as K extends `/api/v1/auth${string}` ? K : never]: paths[K];
};

export class AuthClient {
  private readonly client: ReturnType<typeof createClient<AuthPaths>>;

  constructor(baseUrl: string) {
    this.client = createClient<AuthPaths>({ baseUrl });
  }

  /** Register a new user */
  async register(body: Record<string, unknown>): Promise<AuthResponseDto> {
    const { data } = await this.client.POST("/api/v1/auth/register", {
        body: body as never,
      });
    return data!;
  }

  /** Login with email and password */
  async login(body: Record<string, unknown>): Promise<AuthResponseDto> {
    const { data } = await this.client.POST("/api/v1/auth/login", {
        body: body as never,
      });
    return data!;
  }

  /** Refresh access token */
  async refresh(): Promise<AuthResponseDto> {
    const { data } = await this.client.POST("/api/v1/auth/refresh");
    return data!;
  }

  /** Logout */
  async logout(): Promise<void> {
    await this.client.POST("/api/v1/auth/logout");
  }

  /** Request password reset */
  async forgotPassword(body: Record<string, unknown>): Promise<void> {
    await this.client.POST("/api/v1/auth/forgot-password", {
        body: body as never,
      });
  }

  /** Reset password with token */
  async resetPassword(body: Record<string, unknown>): Promise<void> {
    await this.client.POST("/api/v1/auth/reset-password", {
        body: body as never,
      });
  }

  /** Login with Google */
  async googleAuth(): Promise<void> {
    await this.client.GET("/api/v1/auth/google");
  }

  async googleCallback(): Promise<void> {
    await this.client.GET("/api/v1/auth/google/callback");
  }

  /** Login with GitHub */
  async githubAuth(): Promise<void> {
    await this.client.GET("/api/v1/auth/github");
  }

  async githubCallback(): Promise<void> {
    await this.client.GET("/api/v1/auth/github/callback");
  }
}
