export type FlashcardEntity = {
  id: string;
  front: string;
  back: string;
  order: number;
  due: Date;
  lastReviewedAt: Date | null;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: number;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FlashcardResponse = FlashcardEntity;

export type GenerationSource = {
  filename: string;
  mimeType: string;
  extractedCharCount: number;
  originalCharCount: number;
  truncated: boolean;
};

export type GenerateFromMaterialResult =
  | { flashcards: FlashcardResponse[]; persisted: true }
  | { flashcards: Array<{ front: string; back: string }>; persisted: false };

export type GenerateFromFileResponse = GenerateFromMaterialResult & {
  source: GenerationSource;
};
