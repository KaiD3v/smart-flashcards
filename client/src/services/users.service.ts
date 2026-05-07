import { api } from "@/lib/api/client";
import type { User } from "@/types/api";

export type UpdateUserPayload = {
  email?: string;
  nickname?: string;
  name?: string | null;
  password?: string;
};

export const usersService = {
  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.patch<{ user: User }>(`/users/${id}`, payload);
    return data.user;
  },
};
