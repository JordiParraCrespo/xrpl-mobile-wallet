import type { AppAbility } from "@flama/shared";
import { createStore } from "zustand/vanilla";
import type { UserEntity } from "../users/user.entity";

export interface AuthState {
  user: UserEntity | null;
  ability: AppAbility | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthStore = ReturnType<typeof createAuthStore>;

export const createAuthStore = () =>
  createStore<AuthState>(() => ({
    user: null,
    ability: null,
    isAuthenticated: false,
    isLoading: true,
  }));
