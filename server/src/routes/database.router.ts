import { Router, type Request, type Response } from "express";
import type { PrismaClient } from "../../generated/prisma/client";

export function createDatabaseRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ database: "connected" });
    } catch (err) {
      console.error(err);
      res.status(503).json({ database: "unavailable" });
    }
  });

  return router;
}
