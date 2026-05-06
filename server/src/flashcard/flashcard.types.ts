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
