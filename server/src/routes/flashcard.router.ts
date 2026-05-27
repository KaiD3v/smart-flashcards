import { Router } from "express";
import type { PrismaClient } from "../../generated/prisma/client";
import { createRequireAuthMiddleware } from "../auth/auth.middleware";
import type { AuthService } from "../auth/auth.service";
import { FlashcardController } from "../flashcard/flashcard.controller";
import { FlashcardRepository } from "../flashcard/flashcard.repository";
import { FlashcardService } from "../flashcard/flashcard.service";
import { FsrsService } from "../helpers/fsrs";
import {
  createDocumentFileUploadMiddleware,
  requireUploadedDocument,
} from "../middleware/file-upload.middleware";
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
  const fsrsService = new FsrsService();
  const flashcardService = new FlashcardService(
    flashcardRepository,
    subjectService,
    fsrsService
  );
  const controller = new FlashcardController(flashcardService);

  const requireAuth = createRequireAuthMiddleware(authService, authCookieName);
  const uploadDocument = createDocumentFileUploadMiddleware();

  const router = Router({ mergeParams: true });

  router.use(requireAuth);

  router.get("/", controller.findAllBySubject);
  router.get("/need-review", controller.findNeedReviewBySubject);
  router.post("/", controller.create);
  router.post("/generate", controller.generate);
  router.post(
    "/generate-from-file",
    uploadDocument,
    requireUploadedDocument,
    controller.generateFromFile
  );
  router.get("/:flashcardId", controller.findById);
  router.post("/:flashcardId/review", controller.review);
  router.patch("/:flashcardId", controller.update);
  router.delete("/:flashcardId", controller.delete);

  router.use(FlashcardController.handleError);

  return router;
}
