import { Rating, State, createEmptyCard, fsrs } from "ts-fsrs";
import type { CardInput, Grade } from "ts-fsrs";
import type { FsrsReviewInput, FsrsReviewOutput, FsrsReviewRating } from "./fsrs.types";

const scheduler = fsrs();
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toRating(rating: FsrsReviewRating): Grade {
  if (rating === "again") {
    return Rating.Again;
  }
  if (rating === "hard") {
    return Rating.Hard;
  }
  if (rating === "easy") {
    return Rating.Easy;
  }
  return Rating.Good;
}

function elapsedDays(now: Date, lastReviewedAt: Date): number {
  const elapsed = Math.floor((now.getTime() - lastReviewedAt.getTime()) / DAY_IN_MS);
  return Math.max(0, elapsed);
}

function scheduledDays(lastReviewedAt: Date, due: Date): number {
  const scheduled = Math.floor((due.getTime() - lastReviewedAt.getTime()) / DAY_IN_MS);
  return Math.max(0, scheduled);
}

function toCard(input: FsrsReviewInput): CardInput {
  if (!input.lastReviewedAt || input.reps <= 0) {
    return createEmptyCard(input.now);
  }

  return {
    due: input.due,
    stability: input.stability,
    difficulty: input.difficulty,
    elapsed_days: elapsedDays(input.now, input.lastReviewedAt),
    scheduled_days: scheduledDays(input.lastReviewedAt, input.due),
    learning_steps: 0,
    reps: input.reps,
    lapses: input.lapses,
    state: input.state,
    last_review: input.lastReviewedAt,
  };
}

export class FsrsService {
  review(input: FsrsReviewInput): FsrsReviewOutput {
    const record = scheduler.next(toCard(input), input.now, toRating(input.rating));

    return {
      stability: record.card.stability,
      difficulty: record.card.difficulty,
      due: record.card.due,
      lastReviewedAt: record.card.last_review ?? input.now,
      elapsedDays: record.card.elapsed_days,
      scheduledDays: record.card.scheduled_days,
      learningSteps: record.card.learning_steps,
      reps: record.card.reps,
      lapses: record.card.lapses,
      state: record.card.state,
    };
  }

  initialState(now: Date): FsrsReviewOutput {
    const card = createEmptyCard(now);
    return {
      stability: card.stability,
      difficulty: card.difficulty,
      due: card.due,
      lastReviewedAt: now,
      elapsedDays: card.elapsed_days,
      scheduledDays: card.scheduled_days,
      learningSteps: card.learning_steps,
      reps: card.reps,
      lapses: card.lapses,
      state: State.New,
    };
  }
}
