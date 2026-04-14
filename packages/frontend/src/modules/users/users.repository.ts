import type { UsersClient } from "@flama/api-client/users";
import type { PaginatedResponse, UpdateUserDto } from "@flama/shared";
import { inject, injectable } from "inversify";
import { TOKENS } from "../../di/tokens";
import { AppError } from "../core/errors";
import { UserEntity } from "./user.entity";
import { UsersErrors } from "./users.errors";

function toEntity(data: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  provider: "local" | "google" | "github";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}): UserEntity {
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

@injectable()
export class UsersRepository {
  constructor(
    @inject(TOKENS.UsersClient) private readonly usersClient: UsersClient
  ) {}

  async findAll(params?: {
    page?: number;
    limit?: number;
    role?: "admin" | "user";
    search?: string;
  }): Promise<PaginatedResponse<UserEntity>> {
    const { data } = await this.usersClient.GET("/api/v1/users", {
      params: { query: params },
    });
    if (!data) throw new AppError(UsersErrors.FETCH_LIST_FAILED);
    return {
      data: data.data.map(toEntity),
      meta: data.meta,
    };
  }

  async me(): Promise<UserEntity> {
    const { data } = await this.usersClient.GET("/api/v1/users/me");
    if (!data) throw new AppError(UsersErrors.FETCH_FAILED);
    return toEntity(data);
  }

  async findById(id: string): Promise<UserEntity> {
    const { data } = await this.usersClient.GET("/api/v1/users/{id}", {
      params: { path: { id } },
    });
    if (!data) throw new AppError(UsersErrors.FETCH_FAILED);
    return toEntity(data);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const { data } = await this.usersClient.PATCH("/api/v1/users/{id}", {
      params: { path: { id } },
      body: dto,
    });
    if (!data) throw new AppError(UsersErrors.UPDATE_FAILED);
    return toEntity(data);
  }

  async delete(id: string): Promise<void> {
    await this.usersClient.DELETE("/api/v1/users/{id}", {
      params: { path: { id } },
    });
  }
}
