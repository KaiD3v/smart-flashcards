import { Router } from "express";
import type { PrismaClient } from "../../generated/prisma/client";
import { createAuthRouter } from "./auth.router";
import { createDatabaseRouter } from "./database.router";
import { healthRouter } from "./health.router";
import { createSubjectRouter } from "./subject.router";
import { createUserRouter } from "./user.router";

export function createRootRouter(prisma: PrismaClient): Router {
  const router = Router();

  const auth = createAuthRouter(prisma);

  router.use("/health", healthRouter);
  router.use("/db-health", createDatabaseRouter(prisma));
  router.use("/auth", auth.router);
  router.use("/users", createUserRouter(prisma, auth.authService, auth.cookieName));
  router.use("/subjects", createSubjectRouter(prisma, auth.authService, auth.cookieName));

  return router;
}
