export type User = {
  id: string;
  email: string;
  nickname: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Subject = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  order: number;
  due: string;
  lastReviewedAt: string | null;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: number;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
};

export type GeneratedFlashcardDraft = {
  front: string;
  back: string;
};

export type GenerationSource = {
  filename: string;
  mimeType: string;
  extractedCharCount: number;
  originalCharCount: number;
  truncated: boolean;
};

export type GenerationResult =
  | { flashcards: Flashcard[]; persisted: true; source?: GenerationSource }
  | { flashcards: GeneratedFlashcardDraft[]; persisted: false; source?: GenerationSource };

export type ReviewRating = "again" | "hard" | "good" | "easy";

export const REVIEW_RATINGS: ReadonlyArray<ReviewRating> = [
  "again",
  "hard",
  "good",
  "easy",
];

export const FSRS_STATE_LABEL: Record<number, string> = {
  0: "New",
  1: "Learning",
  2: "Review",
  3: "Relearning",
};

export type ApiIssue = {
  path?: (string | number)[];
  message: string;
  code?: string;
};

export type ApiError = {
  message: string;
  status: number;
  issues?: ApiIssue[];
};
