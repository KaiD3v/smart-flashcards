import { api } from "@/lib/api/client";
import type {
  Flashcard,
  GenerationResult,
  ReviewRating,
} from "@/types/api";

export type CreateFlashcardPayload = {
  front: string;
  back: string;
  order?: number;
};

export type UpdateFlashcardPayload = {
  front?: string;
  back?: string;
  order?: number;
};

export type GenerateFlashcardsPayload = {
  materialText: string;
  maxCards?: number;
  model?: string;
  persist?: boolean;
};

export const flashcardsService = {
  async listBySubject(subjectId: string): Promise<Flashcard[]> {
    const { data } = await api.get<{ flashcards: Flashcard[] }>(
      `/subjects/${subjectId}/flashcards`
    );
    return data.flashcards;
  },

  async listNeedReview(subjectId: string): Promise<Flashcard[]> {
    const { data } = await api.get<{ flashcards: Flashcard[] }>(
      `/subjects/${subjectId}/flashcards/need-review`
    );
    return data.flashcards;
  },

  async get(subjectId: string, flashcardId: string): Promise<Flashcard> {
    const { data } = await api.get<{ flashcard: Flashcard }>(
      `/subjects/${subjectId}/flashcards/${flashcardId}`
    );
    return data.flashcard;
  },

  async create(
    subjectId: string,
    payload: CreateFlashcardPayload
  ): Promise<Flashcard> {
    const { data } = await api.post<{ flashcard: Flashcard }>(
      `/subjects/${subjectId}/flashcards`,
      payload
    );
    return data.flashcard;
  },

  async update(
    subjectId: string,
    flashcardId: string,
    payload: UpdateFlashcardPayload
  ): Promise<Flashcard> {
    const { data } = await api.patch<{ flashcard: Flashcard }>(
      `/subjects/${subjectId}/flashcards/${flashcardId}`,
      payload
    );
    return data.flashcard;
  },

  async remove(subjectId: string, flashcardId: string): Promise<void> {
    await api.delete(`/subjects/${subjectId}/flashcards/${flashcardId}`);
  },

  async review(
    subjectId: string,
    flashcardId: string,
    rating: ReviewRating
  ): Promise<Flashcard> {
    const { data } = await api.post<{ flashcard: Flashcard }>(
      `/subjects/${subjectId}/flashcards/${flashcardId}/review`,
      { rating }
    );
    return data.flashcard;
  },

  async generate(
    subjectId: string,
    payload: GenerateFlashcardsPayload
  ): Promise<GenerationResult> {
    const { data } = await api.post<GenerationResult>(
      `/subjects/${subjectId}/flashcards/generate`,
      payload
    );
    return data;
  },
};
