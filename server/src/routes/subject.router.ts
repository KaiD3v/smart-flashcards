import { Router } from "express";
import type { PrismaClient } from "../../generated/prisma/client";
import { createRequireAuthMiddleware } from "../auth/auth.middleware";
import type { AuthService } from "../auth/auth.service";
import { SubjectController } from "../subject/subject.controller";
import { SubjectRepository } from "../subject/subject.repository";
import { SubjectService } from "../subject/subject.service";

export function createSubjectRouter(
  prisma: PrismaClient,
  authService: AuthService,
  authCookieName: string
): Router {
  const repository = new SubjectRepository(prisma);
  const service = new SubjectService(repository);
  const controller = new SubjectController(service);

  const requireAuth = createRequireAuthMiddleware(authService, authCookieName);

  const router = Router();

  router.use(requireAuth);

  router.post("/", controller.create);
  router.get("/", controller.findAll);
  router.get("/:id", controller.findById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);

  router.use(SubjectController.handleError);

  return router;
}
