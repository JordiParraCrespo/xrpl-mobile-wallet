import type { PaginatedResponse, UpdateUserDto } from "@flama/shared";
import type { UserEntity } from "./user.entity";
import { inject, injectable } from "inversify";
import { TOKENS } from "../../di/tokens";
import type { UsersRepository } from "./users.repository";
import type { UsersStore } from "./users.state";

@injectable()
export class UsersService {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly usersRepository: UsersRepository,
    @inject(TOKENS.UsersStore)
    public readonly store: UsersStore
  ) {}

  async findAll(params?: {
    page?: number;
    limit?: number;
    role?: "admin" | "user";
    search?: string;
  }): Promise<PaginatedResponse<UserEntity>> {
    const result = await this.usersRepository.findAll(params);
    this.store.setState({
      users: result.data,
      total: result.meta.total,
      page: result.meta.page,
      totalPages: result.meta.totalPages,
      isLoading: false,
    });
    return result;
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    this.store.setState({ selectedUser: user });
    return user;
  }

  async me() {
    const user = await this.usersRepository.me();
    this.store.setState({ selectedUser: user });
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.usersRepository.update(id, dto);
    this.store.setState((state) => ({
      selectedUser: state.selectedUser?.id === id ? user : state.selectedUser,
      users: state.users.map((u) => (u.id === id ? user : u)),
    }));
    return user;
  }

  async delete(id: string) {
    await this.usersRepository.delete(id);
    this.store.setState((state) => ({
      users: state.users.filter((u) => u.id !== id),
      selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
      total: state.total - 1,
    }));
  }
}
