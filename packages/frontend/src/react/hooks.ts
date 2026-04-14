"use client";
import { useStore } from "zustand";
import type { AuthService } from "../modules/auth/auth.service";
import type { AuthState } from "../modules/auth/auth.state";
import type { UsersService } from "../modules/users/users.service";
import type { UsersState } from "../modules/users/users.state";
import { useFlamaApp } from "./context";

export function useAuth(): AuthService {
  return useFlamaApp().auth;
}

export function useAuthState(): AuthState {
  const auth = useFlamaApp().auth;
  return useStore(auth.store);
}

export function useUsers(): UsersService {
  return useFlamaApp().users;
}

export function useUsersState(): UsersState {
  const users = useFlamaApp().users;
  return useStore(users.store);
}
