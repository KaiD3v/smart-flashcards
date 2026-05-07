import { api } from "@/lib/api/client";
import type { Subject } from "@/types/api";

export type CreateSubjectPayload = {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
};

export type UpdateSubjectPayload = {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
};

export const subjectsService = {
  async list(): Promise<Subject[]> {
    const { data } = await api.get<{ subjects: Subject[] }>("/subjects");
    return data.subjects;
  },

  async get(id: string): Promise<Subject> {
    const { data } = await api.get<{ subject: Subject }>(`/subjects/${id}`);
    return data.subject;
  },

  async create(payload: CreateSubjectPayload): Promise<Subject> {
    const { data } = await api.post<{ subject: Subject }>("/subjects", payload);
    return data.subject;
  },

  async update(id: string, payload: UpdateSubjectPayload): Promise<Subject> {
    const { data } = await api.patch<{ subject: Subject }>(
      `/subjects/${id}`,
      payload
    );
    return data.subject;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/subjects/${id}`);
  },
};
