// Auto-generated — do not edit manually.
// Run `pnpm generate` to regenerate.

import createClient from "openapi-fetch";
import type { paths } from "../generated/api";
import type { UserResponseDto } from "../models";

type UsersPaths = {
  [K in keyof paths as K extends `/api/v1/users${string}` ? K : never]: paths[K];
};

export class UsersClient {
  private readonly client: ReturnType<typeof createClient<UsersPaths>>;

  constructor(baseUrl: string) {
    this.client = createClient<UsersPaths>({ baseUrl });
  }

  /** List all users */
  async findAll(): Promise<void> {
    await this.client.GET("/api/v1/users");
  }

  /** Get current user profile */
  async me(): Promise<UserResponseDto> {
    const { data } = await this.client.GET("/api/v1/users/me");
    return data!;
  }

  /** Get user by ID */
  async findOne(id: string): Promise<UserResponseDto> {
    const { data } = await this.client.GET("/api/v1/users/{id}", {
        params: { path: { id } },
      });
    return data!;
  }

  /** Update user */
  async update(id: string, body: Record<string, unknown>): Promise<UserResponseDto> {
    const { data } = await this.client.PATCH("/api/v1/users/{id}", {
        params: { path: { id } },
        body: body as never,
      });
    return data!;
  }

  /** Delete user */
  async remove(id: string): Promise<void> {
    await this.client.DELETE("/api/v1/users/{id}", {
        params: { path: { id } },
      });
  }
}
