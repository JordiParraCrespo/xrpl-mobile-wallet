import { createStore } from "zustand/vanilla";
import type { UserEntity } from "./user.entity";

export interface UsersState {
  users: UserEntity[];
  selectedUser: UserEntity | null;
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
}

export type UsersStore = ReturnType<typeof createUsersStore>;

export const createUsersStore = () =>
  createStore<UsersState>(() => ({
    users: [],
    selectedUser: null,
    total: 0,
    page: 1,
    totalPages: 0,
    isLoading: true,
  }));
