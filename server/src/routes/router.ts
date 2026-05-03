import { Router } from "express";
import type { PrismaClient } from "../../generated/prisma/client";
import { createAuthRouter } from "./auth.router";
import { createDatabaseRouter } from "./database.router";
import { healthRouter } from "./health.router";

export function createRootRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.use("/health", healthRouter);
  router.use("/db-health", createDatabaseRouter(prisma));
  router.use("/auth", createAuthRouter(prisma));

  return router;
}
