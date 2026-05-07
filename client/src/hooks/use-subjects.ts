"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  subjectsService,
  type CreateSubjectPayload,
  type UpdateSubjectPayload,
} from "@/services/subjects.service";
import { normalizeError } from "@/lib/api/error";
import type { Subject } from "@/types/api";

export const subjectsKeys = {
  all: ["subjects"] as const,
  list: () => ["subjects", "list"] as const,
  detail: (id: string) => ["subjects", "detail", id] as const,
};

export function useSubjects(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: subjectsKeys.list(),
    queryFn: () => subjectsService.list(),
    enabled: options?.enabled ?? true,
  });

  return {
    subjects: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useSubject(id: string | undefined) {
  return useQuery({
    queryKey: id ? subjectsKeys.detail(id) : ["subjects", "detail", "missing"],
    queryFn: () => subjectsService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubjectPayload) => subjectsService.create(payload),
    onSuccess: (subject) => {
      qc.setQueryData<Subject[] | undefined>(subjectsKeys.list(), (prev) =>
        prev ? [subject, ...prev] : [subject]
      );
      qc.setQueryData(subjectsKeys.detail(subject.id), subject);
      toast.success("Subject created", {
        description: subject.name,
      });
    },
    onError: (error) => {
      const normalized = normalizeError(error);
      toast.error("Could not create subject", {
        description: normalized.message,
      });
    },
  });
}

export function useUpdateSubject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSubjectPayload) =>
      subjectsService.update(id, payload),
    onSuccess: (subject) => {
      qc.setQueryData(subjectsKeys.detail(subject.id), subject);
      qc.setQueryData<Subject[] | undefined>(subjectsKeys.list(), (prev) =>
        prev?.map((item) => (item.id === subject.id ? subject : item))
      );
      toast.success("Subject updated");
    },
    onError: (error) => {
      const normalized = normalizeError(error);
      toast.error("Could not update subject", {
        description: normalized.message,
      });
    },
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subjectsService.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: subjectsKeys.list() });
      const previous = qc.getQueryData<Subject[]>(subjectsKeys.list());
      qc.setQueryData<Subject[] | undefined>(subjectsKeys.list(), (prev) =>
        prev?.filter((subject) => subject.id !== id)
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(subjectsKeys.list(), context.previous);
      }
      const normalized = normalizeError(error);
      toast.error("Could not delete subject", {
        description: normalized.message,
      });
    },
    onSuccess: () => {
      toast.success("Subject deleted");
    },
  });
}
