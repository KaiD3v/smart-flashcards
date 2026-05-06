export type FsrsReviewRating = "again" | "hard" | "good" | "easy";

export type FsrsReviewInput = {
  stability: number;
  difficulty: number;
  due: Date;
  lastReviewedAt: Date | null;
  reps: number;
  lapses: number;
  state: number;
  rating: FsrsReviewRating;
  now: Date;
};

export type FsrsReviewOutput = {
  stability: number;
  difficulty: number;
  due: Date;
  lastReviewedAt: Date;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: number;
};
