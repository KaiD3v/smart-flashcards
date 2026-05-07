"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  flashcardsService,
  type CreateFlashcardPayload,
  type GenerateFlashcardsPayload,
  type UpdateFlashcardPayload,
} from "@/services/flashcards.service";
import { normalizeError } from "@/lib/api/error";
import type { Flashcard, GenerationResult, ReviewRating } from "@/types/api";

export const flashcardsKeys = {
  all: ["flashcards"] as const,
  list: (subjectId: string) =>
    ["flashcards", "list", subjectId] as const,
  needReview: (subjectId: string) =>
    ["flashcards", "need-review", subjectId] as const,
  detail: (subjectId: string, flashcardId: string) =>
    ["flashcards", "detail", subjectId, flashcardId] as const,
};

export function useFlashcards(subjectId: string | undefined) {
  return useQuery({
    queryKey: subjectId ? flashcardsKeys.list(subjectId) : ["flashcards", "list", "missing"],
    queryFn: () => flashcardsService.listBySubject(subjectId as string),
    enabled: Boolean(subjectId),
  });
}

export function useFlashcardsNeedReview(subjectId: string | undefined) {
  return useQuery({
    queryKey: subjectId ? flashcardsKeys.needReview(subjectId) : ["flashcards", "need-review", "missing"],
    queryFn: () => flashcardsService.listNeedReview(subjectId as string),
    enabled: Boolean(subjectId),
  });
}

export function useCreateFlashcard(subjectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFlashcardPayload) =>
      flashcardsService.create(subjectId, payload),
    onSuccess: (flashcard) => {
      qc.setQueryData<Flashcard[] | undefined>(
        flashcardsKeys.list(subjectId),
        (prev) => (prev ? [...prev, flashcard] : [flashcard])
      );
      qc.invalidateQueries({ queryKey: flashcardsKeys.needReview(subjectId) });
      toast.success("Flashcard created");
    },
    onError: (error) => {
      const normalized = normalizeError(error);
      toast.error("Could not create flashcard", {
        description: normalized.message,
      });
    },
  });
}

export function useUpdateFlashcard(subjectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      flashcardId,
      payload,
    }: {
      flashcardId: string;
      payload: UpdateFlashcardPayload;
    }) => flashcardsService.update(subjectId, flashcardId, payload),
    onSuccess: (flashcard) => {
      qc.setQueryData<Flashcard[] | undefined>(
        flashcardsKeys.list(subjectId),
        (prev) =>
          prev?.map((item) => (item.id === flashcard.id ? flashcard : item))
      );
      qc.setQueryData(
        flashcardsKeys.detail(subjectId, flashcard.id),
        flashcard
      );
      toast.success("Flashcard updated");
    },
    onError: (error) => {
      const normalized = normalizeError(error);
      toast.error("Could not update flashcard", {
        description: normalized.message,
      });
    },
  });
}

export function useDeleteFlashcard(subjectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flashcardId: string) =>
      flashcardsService.remove(subjectId, flashcardId),
    onMutate: async (flashcardId) => {
      await qc.cancelQueries({ queryKey: flashcardsKeys.list(subjectId) });
      const previous = qc.getQueryData<Flashcard[]>(
        flashcardsKeys.list(subjectId)
      );
      qc.setQueryData<Flashcard[] | undefined>(
        flashcardsKeys.list(subjectId),
        (prev) => prev?.filter((item) => item.id !== flashcardId)
      );
      return { previous };
    },
    onError: (error, _flashcardId, context) => {
      if (context?.previous) {
        qc.setQueryData(flashcardsKeys.list(subjectId), context.previous);
      }
      const normalized = normalizeError(error);
      toast.error("Could not delete flashcard", {
        description: normalized.message,
      });
    },
    onSuccess: () => {
      toast.success("Flashcard deleted");
      qc.invalidateQueries({ queryKey: flashcardsKeys.needReview(subjectId) });
    },
  });
}

export function useReviewFlashcard(subjectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      flashcardId,
      rating,
    }: {
      flashcardId: string;
      rating: ReviewRating;
    }) => flashcardsService.review(subjectId, flashcardId, rating),
    onSuccess: (flashcard) => {
      qc.setQueryData<Flashcard[] | undefined>(
        flashcardsKeys.list(subjectId),
        (prev) =>
          prev?.map((item) => (item.id === flashcard.id ? flashcard : item))
      );
      qc.invalidateQueries({ queryKey: flashcardsKeys.needReview(subjectId) });
    },
    onError: (error) => {
      const normalized = normalizeError(error);
      toast.error("Review failed", {
        description: normalized.message,
      });
    },
  });
}

export function useGenerateFlashcards(subjectId: string) {
  const qc = useQueryClient();
  return useMutation<GenerationResult, unknown, GenerateFlashcardsPayload>({
    mutationFn: (payload) => flashcardsService.generate(subjectId, payload),
    onSuccess: (result) => {
      if (result.persisted) {
        qc.setQueryData<Flashcard[] | undefined>(
          flashcardsKeys.list(subjectId),
          (prev) => (prev ? [...prev, ...result.flashcards] : result.flashcards)
        );
        qc.invalidateQueries({ queryKey: flashcardsKeys.needReview(subjectId) });
      }
    },
    onError: (error) => {
      const normalized = normalizeError(error);
      toast.error("Could not generate flashcards", {
        description: normalized.message,
      });
    },
  });
}
