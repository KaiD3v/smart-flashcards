import type { PrismaClient } from "../../generated/prisma/client";
import type { FlashcardEntity } from "./flashcard.types";

export type CreateFlashcardInput = {
  subjectId: string;
  front: string;
  back: string;
  order: number;
};

export type UpdateFlashcardInput = {
  front?: string;
  back?: string;
  order?: number;
};

export class FlashcardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByIdForUser(
    flashcardId: string,
    ownerUserId: string
  ): Promise<FlashcardEntity | null> {
    return this.prisma.flashcard.findFirst({
      where: {
        id: flashcardId,
        subject: { userId: ownerUserId },
      },
    });
  }

  async findManyForUserBySubjectId(
    subjectId: string,
    ownerUserId: string
  ): Promise<FlashcardEntity[]> {
    return this.prisma.flashcard.findMany({
      where: {
        subjectId,
        subject: { userId: ownerUserId },
      },
      orderBy: { order: "asc" },
    });
  }

  async getNextOrderForSubject(subjectId: string): Promise<number> {
    const agg = await this.prisma.flashcard.aggregate({
      where: { subjectId },
      _max: { order: true },
    });
    return (agg._max.order ?? -1) + 1;
  }

  async create(input: CreateFlashcardInput): Promise<FlashcardEntity> {
    return this.prisma.flashcard.create({
      data: {
        subjectId: input.subjectId,
        front: input.front,
        back: input.back,
        order: input.order,
      },
    });
  }

  async createManyForSubject(
    subjectId: string,
    items: Array<{ front: string; back: string }>,
    startOrder: number
  ): Promise<FlashcardEntity[]> {
    if (items.length === 0) {
      return [];
    }

    return this.prisma.$transaction(
      items.map((item, index) =>
        this.prisma.flashcard.create({
          data: {
            subjectId,
            front: item.front,
            back: item.back,
            order: startOrder + index,
          },
        })
      )
    );
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

    return this.prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        ...(input.front !== undefined ? { front: input.front } : {}),
        ...(input.back !== undefined ? { back: input.back } : {}),
        ...(input.order !== undefined ? { order: input.order } : {}),
      },
    });
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
}
