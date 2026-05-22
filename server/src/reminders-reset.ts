import "dotenv/config";
import { PrismaClientSingleton } from "./db/prisma";
import { ReviewReminderRepository } from "./review-reminder/review-reminder.repository";

const prisma = PrismaClientSingleton.getInstance().prisma;
const repository = new ReviewReminderRepository(prisma);

repository
  .resetAllReminderTimestamps()
  .then(() => {
    console.log("[review-reminder] lastReviewReminderSentAt cleared for all users.");
  })
  .catch((error) => {
    console.error("[review-reminder] Reset failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
