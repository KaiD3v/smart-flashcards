const DEFAULT_CRON = "0 8 * * *";
const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

/**
 * REVIEW_REMINDER_CRON tem prioridade; senão REVIEW_REMINDER_TIME (HH:MM); senão 08:00.
 */
export function resolveReviewReminderCron(): string {
  const cronFromEnv = process.env.REVIEW_REMINDER_CRON?.trim();
  if (cronFromEnv) {
    return cronFromEnv;
  }

  const timeFromEnv = process.env.REVIEW_REMINDER_TIME?.trim();
  if (timeFromEnv) {
    const match = TIME_PATTERN.exec(timeFromEnv);
    if (!match) {
      throw new Error(
        `Invalid REVIEW_REMINDER_TIME "${timeFromEnv}". Expected HH:MM (e.g. 01:32).`
      );
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      throw new Error(
        `Invalid REVIEW_REMINDER_TIME "${timeFromEnv}". Hour must be 0-23 and minute 0-59.`
      );
    }

    return `${minute} ${hour} * * *`;
  }

  return DEFAULT_CRON;
}
