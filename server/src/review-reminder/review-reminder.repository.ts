import { Prisma, type PrismaClient } from "../../generated/prisma/client";
import type { UserDueSummary } from "./review-reminder.types";

type UserReminderRow = {
  userId: string;
  lastReviewReminderSentAt: Date | null;
};

export class ReviewReminderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUsersWithDueFlashcards(now: Date): Promise<UserDueSummary[]> {
    const rows = await this.prisma.flashcard.findMany({
      where: {
        due: { lte: now },
        subject: { isActive: true },
      },
      select: {
        subjectId: true,
        subject: {
          select: {
            id: true,
            name: true,
            userId: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    const byUser = new Map<string, UserDueSummary>();
    const userIds = new Set<string>();

    for (const row of rows) {
      const user = row.subject.user;
      const userId = user.id;
      userIds.add(userId);

      let summary = byUser.get(userId);

      if (!summary) {
        summary = {
          userId,
          email: user.email,
          userName: user.name ?? user.nickname,
          lastReviewReminderSentAt: null,
          subjects: [],
          totalDueCount: 0,
        };
        byUser.set(userId, summary);
      }

      summary.totalDueCount += 1;

      const existingSubject = summary.subjects.find((s) => s.subjectId === row.subjectId);
      if (existingSubject) {
        existingSubject.dueCount += 1;
      } else {
        summary.subjects.push({
          subjectId: row.subjectId,
          subjectName: row.subject.name,
          dueCount: 1,
        });
      }
    }

    if (userIds.size > 0) {
      const reminderRows = await this.prisma.$queryRaw<UserReminderRow[]>`
        SELECT id AS "userId", "lastReviewReminderSentAt"
        FROM "User"
        WHERE id IN (${Prisma.join([...userIds])})
      `;

      for (const reminderRow of reminderRows) {
        const summary = byUser.get(reminderRow.userId);
        if (summary) {
          summary.lastReviewReminderSentAt = reminderRow.lastReviewReminderSentAt;
        }
      }
    }

    for (const summary of byUser.values()) {
      summary.subjects.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    }

    return [...byUser.values()].sort((a, b) => a.email.localeCompare(b.email));
  }

  async markReminderSent(userId: string, sentAt: Date): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "User"
      SET "lastReviewReminderSentAt" = ${sentAt}
      WHERE id = ${userId}
    `;
  }

  async resetAllReminderTimestamps(): Promise<number> {
    return this.prisma.$executeRaw`
      UPDATE "User" SET "lastReviewReminderSentAt" = NULL
    `;
  }
}
