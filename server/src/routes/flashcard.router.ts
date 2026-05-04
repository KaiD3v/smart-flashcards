import { Router } from "express";
import type { PrismaClient } from "../../generated/prisma/client";
import { createRequireAuthMiddleware } from "../auth/auth.middleware";
import type { AuthService } from "../auth/auth.service";
import { FlashcardController } from "../flashcard/flashcard.controller";
import { FlashcardRepository } from "../flashcard/flashcard.repository";
import { FlashcardService } from "../flashcard/flashcard.service";
import { SubjectRepository } from "../subject/subject.repository";
import { SubjectService } from "../subject/subject.service";

/**
 * Rotas aninhadas em `/subjects/:id/flashcards` (use `mergeParams` no router pai).
 */
export function createFlashcardRouter(
  prisma: PrismaClient,
  authService: AuthService,
  authCookieName: string
): Router {
  const flashcardRepository = new FlashcardRepository(prisma);
  const subjectRepository = new SubjectRepository(prisma);
  const subjectService = new SubjectService(subjectRepository);
  const flashcardService = new FlashcardService(flashcardRepository, subjectService);
  const controller = new FlashcardController(flashcardService);

  const requireAuth = createRequireAuthMiddleware(authService, authCookieName);

  const router = Router({ mergeParams: true });

  router.use(requireAuth);

  router.get("/", controller.findAllBySubject);
  router.post("/", controller.create);
  router.post("/generate", controller.generate);
  router.get("/:flashcardId", controller.findById);
  router.patch("/:flashcardId", controller.update);
  router.delete("/:flashcardId", controller.delete);

  router.use(FlashcardController.handleError);

  return router;
}
