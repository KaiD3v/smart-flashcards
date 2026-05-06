import type { PrismaClient } from "../../generated/prisma/client";
import type { FlashcardEntity } from "./flashcard.types";

export type CreateFlashcardInput = {
  subjectId: string;
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
};

export type UpdateFlashcardInput = {
  front?: string;
  back?: string;
  order?: number;
};

export type UpdateFlashcardReviewInput = {
  due: Date;
  lastReviewedAt: Date;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: number;
};

type FlashcardRow = Awaited<ReturnType<PrismaClient["flashcard"]["findFirst"]>>;

function toEntity(row: NonNullable<FlashcardRow>): FlashcardEntity {
  return {
    id: row.id,
    front: row.front,
    back: row.back,
    order: row.order,
    due: row.due,
    lastReviewedAt: row.lastReviewedAt,
    stability: row.stability,
    difficulty: row.difficulty,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    subjectId: row.subjectId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class FlashcardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByIdForUser(
    flashcardId: string,
    ownerUserId: string
  ): Promise<FlashcardEntity | null> {
    const row = await this.prisma.flashcard.findFirst({
      where: {
        id: flashcardId,
        subject: { userId: ownerUserId },
      },
    });
    return row ? toEntity(row) : null;
  }

  async findManyForUserBySubjectId(
    subjectId: string,
    ownerUserId: string
  ): Promise<FlashcardEntity[]> {
    const rows = await this.prisma.flashcard.findMany({
      where: {
        subjectId,
        subject: { userId: ownerUserId },
      },
      orderBy: { order: "asc" },
    });
    return rows.map(toEntity);
  }

  async findNeedReviewForUserBySubjectId(
    subjectId: string,
    ownerUserId: string,
    now: Date
  ): Promise<FlashcardEntity[]> {
    const rows = await this.prisma.flashcard.findMany({
      where: {
        subjectId,
        due: { lte: now },
        subject: { userId: ownerUserId },
      },
      orderBy: { due: "asc" },
    });
    return rows.map(toEntity);
  }

  async getNextOrderForSubject(subjectId: string): Promise<number> {
    const agg = await this.prisma.flashcard.aggregate({
      where: { subjectId },
      _max: { order: true },
    });
    return (agg._max.order ?? -1) + 1;
  }

  async create(input: CreateFlashcardInput): Promise<FlashcardEntity> {
    const row = await this.prisma.flashcard.create({
      data: {
        subjectId: input.subjectId,
        front: input.front,
        back: input.back,
        order: input.order,
        due: input.due,
        lastReviewedAt: input.lastReviewedAt,
        stability: input.stability,
        difficulty: input.difficulty,
        reps: input.reps,
        lapses: input.lapses,
        state: input.state,
      },
    });
    return toEntity(row);
  }

  async createManyForSubject(
    subjectId: string,
    items: Array<{ front: string; back: string }>,
    startOrder: number
  ): Promise<FlashcardEntity[]> {
    if (items.length === 0) {
      return [];
    }

    const rows = await this.prisma.$transaction(
      items.map((item, index) =>
        this.prisma.flashcard.create({
          data: {
            subjectId,
            front: item.front,
            back: item.back,
            order: startOrder + index,
            due: new Date(),
            stability: 0,
            difficulty: 0,
            reps: 0,
            lapses: 0,
            state: 0,
          },
        })
      )
    );
    return rows.map(toEntity);
  }

  async updateForUser(
    flashcardId: string,
    ownerUserId: string,
    input: UpdateFlashcardInput
  ): Promise<FlashcardEntity | null> {
    const existing = await this.findByIdForUser(flashcardId, ownerUserId);
    if (!existing) {
      return null;
    }

    const row = await this.prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        ...(input.front !== undefined ? { front: input.front } : {}),
        ...(input.back !== undefined ? { back: input.back } : {}),
        ...(input.order !== undefined ? { order: input.order } : {}),
      },
    });
    return toEntity(row);
  }

  async deleteForUser(
    flashcardId: string,
    ownerUserId: string
  ): Promise<FlashcardEntity | null> {
    const existing = await this.findByIdForUser(flashcardId, ownerUserId);
    if (!existing) {
      return null;
    }

    await this.prisma.flashcard.delete({ where: { id: flashcardId } });
    return existing;
  }

  async updateReviewForUser(
    flashcardId: string,
    ownerUserId: string,
    input: UpdateFlashcardReviewInput
  ): Promise<FlashcardEntity | null> {
    const existing = await this.findByIdForUser(flashcardId, ownerUserId);
    if (!existing) {
      return null;
    }

    const row = await this.prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        due: input.due,
        lastReviewedAt: input.lastReviewedAt,
        stability: input.stability,
        difficulty: input.difficulty,
        reps: input.reps,
        lapses: input.lapses,
        state: input.state,
      },
    });
    return toEntity(row);
  }
}
