import { MailService } from "../mail/mail.service";
import { ReviewReminderRepository } from "./review-reminder.repository";
import type { UserDueSummary } from "./review-reminder.types";

const dayFormatterCache = new Map<string, Intl.DateTimeFormat>();

function formatDayKey(date: Date, timeZone: string): string {
  let formatter = dayFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dayFormatterCache.set(timeZone, formatter);
  }
  return formatter.format(date);
}

function wasReminderSentToday(
  lastSentAt: Date | null,
  now: Date,
  timeZone: string
): boolean {
  if (!lastSentAt) {
    return false;
  }
  return formatDayKey(lastSentAt, timeZone) === formatDayKey(now, timeZone);
}

function shouldSkipDedupe(): boolean {
  return process.env.REVIEW_REMINDER_SKIP_DEDUPE === "true";
}

export class ReviewReminderService {
  constructor(
    private readonly repository: ReviewReminderRepository,
    private readonly mailService: MailService,
    private readonly timeZone: string
  ) {}

  private isEligibleForReminder(summary: UserDueSummary, now: Date): boolean {
    if (shouldSkipDedupe()) {
      return true;
    }
    return !wasReminderSentToday(summary.lastReviewReminderSentAt, now, this.timeZone);
  }

  async run(now: Date = new Date()): Promise<{ sent: number; skipped: number; failed: number }> {
    const summaries = await this.repository.findUsersWithDueFlashcards(now);
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const summary of summaries) {
      if (!this.isEligibleForReminder(summary, now)) {
        skipped += 1;
        console.log(
          `[review-reminder] Skipped ${summary.email}: already sent today (${this.timeZone}).`
        );
        continue;
      }

      try {
        await this.mailService.sendReviewReminder({
          to: summary.email,
          userName: summary.userName,
          totalDueCount: summary.totalDueCount,
          subjects: summary.subjects.map((subject) => ({
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            dueCount: subject.dueCount,
            reviewUrl: this.mailService.buildSubjectReviewUrl(subject.subjectId),
          })),
        });

        await this.repository.markReminderSent(summary.userId, now);
        sent += 1;
      } catch (error) {
        failed += 1;
        console.error(
          `[review-reminder] Failed to send reminder to ${summary.email}:`,
          error
        );
      }
    }

    console.log(
      `[review-reminder] Run complete: sent=${sent}, skipped=${skipped}, failed=${failed}, totalWithDue=${summaries.length}`
    );

    return { sent, skipped, failed };
  }
}
