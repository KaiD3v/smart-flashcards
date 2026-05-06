import type { NextFunction, Request, Response } from "express";
import { routeParamId } from "../http/route-params";
import { HttpError } from "../auth/auth.errors";
import {
  createFlashcardBodySchema,
  generateFlashcardsBodySchema,
  reviewFlashcardBodySchema,
  updateFlashcardBodySchema,
} from "./flashcard.dto";
import type { FlashcardService } from "./flashcard.service";

function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

function authUserId(req: Request): string {
  const user = req.authUser;
  if (!user) {
    throw new HttpError(401, "Not authenticated");
  }
  return user.id;
}

function subjectIdFromParentParams(req: Request): string | undefined {
  return routeParamId(req, "id");
}

export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subjectId = subjectIdFromParentParams(req);
      if (!subjectId) {
        res.status(400).json({ message: "Subject id is required" });
        return;
      }

      const parsed = createFlashcardBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          issues: parsed.error.issues,
        });
        return;
      }

      const ownerId = authUserId(req);
      const flashcard = await this.flashcardService.create(subjectId, ownerId, parsed.data);
      res.status(201).json({ flashcard });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const flashcardId = routeParamId(req, "flashcardId");
      if (!flashcardId) {
        res.status(400).json({ message: "Flashcard id is required" });
        return;
      }

      const ownerId = authUserId(req);
      const flashcard = await this.flashcardService.findByIdForUser(flashcardId, ownerId);
      res.status(200).json({ flashcard });
    } catch (error) {
      next(error);
    }
  };

  findAllBySubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subjectId = subjectIdFromParentParams(req);
      if (!subjectId) {
        res.status(400).json({ message: "Subject id is required" });
        return;
      }

      const ownerId = authUserId(req);
      const flashcards = await this.flashcardService.findAllForUserBySubject(subjectId, ownerId);
      res.status(200).json({ flashcards });
    } catch (error) {
      next(error);
    }
  };

  findNeedReviewBySubject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const subjectId = subjectIdFromParentParams(req);
      if (!subjectId) {
        res.status(400).json({ message: "Subject id is required" });
        return;
      }

      const ownerId = authUserId(req);
      const flashcards = await this.flashcardService.findNeedReviewForUserBySubject(
        subjectId,
        ownerId
      );
      res.status(200).json({ flashcards });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const flashcardId = routeParamId(req, "flashcardId");
      if (!flashcardId) {
        res.status(400).json({ message: "Flashcard id is required" });
        return;
      }

      const parsed = updateFlashcardBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          issues: parsed.error.issues,
        });
        return;
      }

      const ownerId = authUserId(req);
      const flashcard = await this.flashcardService.updateForUser(flashcardId, ownerId, parsed.data);
      res.status(200).json({ flashcard });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const flashcardId = routeParamId(req, "flashcardId");
      if (!flashcardId) {
        res.status(400).json({ message: "Flashcard id is required" });
        return;
      }

      const ownerId = authUserId(req);
      await this.flashcardService.deleteForUser(flashcardId, ownerId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subjectId = subjectIdFromParentParams(req);
      if (!subjectId) {
        res.status(400).json({ message: "Subject id is required" });
        return;
      }

      const parsed = generateFlashcardsBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          issues: parsed.error.issues,
        });
        return;
      }

      const ownerId = authUserId(req);
      const result = await this.flashcardService.generateFromMaterial(subjectId, ownerId, parsed.data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  review = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const flashcardId = routeParamId(req, "flashcardId");
      if (!flashcardId) {
        res.status(400).json({ message: "Flashcard id is required" });
        return;
      }

      const parsed = reviewFlashcardBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          issues: parsed.error.issues,
        });
        return;
      }

      const ownerId = authUserId(req);
      const flashcard = await this.flashcardService.reviewForUser(
        flashcardId,
        ownerId,
        parsed.data
      );
      res.status(200).json({ flashcard });
    } catch (error) {
      next(error);
    }
  };

  static handleError(
    error: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (isHttpError(error)) {
      res.status(error.statusCode).json({
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      });
      return;
    }
    next(error);
  }
}
