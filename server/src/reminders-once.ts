import "dotenv/config";
import { PrismaClientSingleton } from "./db/prisma";
import { runReviewRemindersOnce } from "./review-reminder/review-reminder.scheduler";

const prisma = PrismaClientSingleton.getInstance().prisma;

runReviewRemindersOnce(prisma)
  .then(() => {
    console.log("[review-reminder] One-off run finished.");
  })
  .catch((error) => {
    console.error("[review-reminder] One-off run failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
