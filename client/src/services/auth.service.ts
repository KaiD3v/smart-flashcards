import { api } from "@/lib/api/client";
import type { User } from "@/types/api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  nickname: string;
  password: string;
  name?: string;
};

export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    const { data } = await api.post<{ user: User }>("/auth/login", payload);
    return data.user;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<{ user: User }>("/auth/register", payload);
    return data.user;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ user: User }>("/auth/me");
    return data.user;
  },
};
