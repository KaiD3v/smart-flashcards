export type FlashcardEntity = {
  id: string;
  front: string;
  back: string;
  order: number;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FlashcardResponse = FlashcardEntity;
