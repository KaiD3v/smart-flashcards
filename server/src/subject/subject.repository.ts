import type { PrismaClient } from "../../generated/prisma/client";
import type { SubjectEntity } from "./subject.types";

export type CreateSubjectInput = {
  userId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
};

export type UpdateSubjectInput = {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
};

/**
 * Prisma client with `subject` delegate (run `npm run prisma:generate` after schema changes).
 */
type SubjectDelegate = {
  findFirst(args: {
    where: { id: string; userId: string };
  }): Promise<SubjectEntity | null>;
  findMany(args: {
    where: { userId: string };
    orderBy: { updatedAt: "desc" };
  }): Promise<SubjectEntity[]>;
  create(args: {
    data: {
      userId: string;
      name: string;
      description: string | null;
      imageUrl: string | null;
      isActive: boolean;
    };
  }): Promise<SubjectEntity>;
  update(args: {
    where: { id: string };
    data: {
      name?: string;
      description?: string | null;
      imageUrl?: string | null;
      isActive?: boolean;
    };
  }): Promise<SubjectEntity>;
  delete(args: { where: { id: string } }): Promise<SubjectEntity>;
};

function subjectOf(prisma: PrismaClient): SubjectDelegate {
  return (prisma as unknown as { subject: SubjectDelegate }).subject;
}

export class SubjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByIdForUser(id: string, userId: string): Promise<SubjectEntity | null> {
    return subjectOf(this.prisma).findFirst({ where: { id, userId } });
  }

  findManyByUserId(userId: string): Promise<SubjectEntity[]> {
    return subjectOf(this.prisma).findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  create(input: CreateSubjectInput): Promise<SubjectEntity> {
    return subjectOf(this.prisma).create({
      data: {
        userId: input.userId,
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        isActive: input.isActive,
      },
    });
  }

  async updateForUser(
    id: string,
    userId: string,
    input: UpdateSubjectInput
  ): Promise<SubjectEntity | null> {
    const existing = await this.findByIdForUser(id, userId);
    if (!existing) {
      return null;
    }

    return subjectOf(this.prisma).update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
  }

  async deleteForUser(id: string, userId: string): Promise<SubjectEntity | null> {
    const existing = await this.findByIdForUser(id, userId);
    if (!existing) {
      return null;
    }

    await subjectOf(this.prisma).delete({ where: { id } });
    return existing;
  }
}
