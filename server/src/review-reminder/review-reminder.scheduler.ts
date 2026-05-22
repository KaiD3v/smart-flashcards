import cron from "node-cron";
import type { PrismaClient } from "../../generated/prisma/client";
import { isMailConfigured } from "../mail/mail.config";
import { MailService } from "../mail/mail.service";
import { ReviewReminderRepository } from "./review-reminder.repository";
import { resolveReviewReminderCron } from "./review-reminder.schedule";
import { ReviewReminderService } from "./review-reminder.service";

const DEFAULT_TIMEZONE = "America/Sao_Paulo";

function createReviewReminderService(prisma: PrismaClient): ReviewReminderService {
  const repository = new ReviewReminderRepository(prisma);
  const mailService = new MailService();
  const timeZone = process.env.REVIEW_REMINDER_TIMEZONE?.trim() || DEFAULT_TIMEZONE;
  return new ReviewReminderService(repository, mailService, timeZone);
}

export function startReviewReminderScheduler(prisma: PrismaClient): void {
  if (!isMailConfigured()) {
    console.warn(
      "[review-reminder] MAIL_* env vars are incomplete; scheduler not started."
    );
    return;
  }

  const timeZone = process.env.REVIEW_REMINDER_TIMEZONE?.trim() || DEFAULT_TIMEZONE;

  let cronExpression: string;
  try {
    cronExpression = resolveReviewReminderCron();
  } catch (error) {
    console.error(
      "[review-reminder] Invalid schedule configuration:",
      error instanceof Error ? error.message : error
    );
    return;
  }

  if (!cron.validate(cronExpression)) {
    console.error(
      `[review-reminder] Invalid cron expression: "${cronExpression}"`
    );
    return;
  }

  const service = createReviewReminderService(prisma);

  cron.schedule(
    cronExpression,
    () => {
      console.log(`[review-reminder] Cron tick at ${new Date().toISOString()}`);
      void service.run(new Date());
    },
    { timezone: timeZone }
  );

  const skipDedupe = process.env.REVIEW_REMINDER_SKIP_DEDUPE === "true";
  const scheduleSource = process.env.REVIEW_REMINDER_CRON?.trim()
    ? "REVIEW_REMINDER_CRON"
    : process.env.REVIEW_REMINDER_TIME?.trim()
      ? `REVIEW_REMINDER_TIME=${process.env.REVIEW_REMINDER_TIME.trim()}`
      : "default 08:00";

  console.log(
    `[review-reminder] Scheduler started (cron="${cronExpression}", timezone="${timeZone}", source=${scheduleSource}${skipDedupe ? ", SKIP_DEDUPE=true" : ""})`
  );

  if (skipDedupe) {
    console.warn(
      "[review-reminder] REVIEW_REMINDER_SKIP_DEDUPE=true — pode enviar mais de 1 e-mail por dia (apenas para testes)."
    );
  }
}

export async function runReviewRemindersOnce(prisma: PrismaClient): Promise<void> {
  if (!isMailConfigured()) {
    throw new Error("MAIL_* environment variables are not fully configured.");
  }

  const service = createReviewReminderService(prisma);
  await service.run(new Date());
}
