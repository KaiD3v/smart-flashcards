import type { NextFunction, Request, Response } from "express";
import { routeParamId } from "../http/route-params";
import { HttpError } from "../auth/auth.errors";
import { createSubjectBodySchema, updateSubjectBodySchema } from "./subject.dto";
import type { SubjectService } from "./subject.service";

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

export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createSubjectBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          issues: parsed.error.issues,
        });
        return;
      }

      const ownerId = authUserId(req);
      const subject = await this.subjectService.create(ownerId, parsed.data);
      res.status(201).json({ subject });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = routeParamId(req);
      if (!id) {
        res.status(400).json({ message: "Subject id is required" });
        return;
      }

      const ownerId = authUserId(req);
      const subject = await this.subjectService.findByIdForUser(id, ownerId);
      res.status(200).json({ subject });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ownerId = authUserId(req);
      const subjects = await this.subjectService.findAllForUser(ownerId);
      res.status(200).json({ subjects });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = routeParamId(req);
      if (!id) {
        res.status(400).json({ message: "Subject id is required" });
        return;
      }

      const parsed = updateSubjectBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          issues: parsed.error.issues,
        });
        return;
      }

      const ownerId = authUserId(req);
      const subject = await this.subjectService.updateForUser(id, ownerId, parsed.data);
      res.status(200).json({ subject });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = routeParamId(req);
      if (!id) {
        res.status(400).json({ message: "Subject id is required" });
        return;
      }

      const ownerId = authUserId(req);
      await this.subjectService.deleteForUser(id, ownerId);
      res.status(204).send();
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
