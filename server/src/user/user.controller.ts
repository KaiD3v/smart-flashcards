import type { NextFunction, Request, Response } from "express";
import { routeParamId } from "../http/route-params";
import { createUserBodySchema, updateUserBodySchema } from "./user.dto";
import { HttpError } from "../auth/auth.errors";
import type { UserService } from "./user.service";

function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

export class UserController {
  constructor(private readonly userService: UserService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createUserBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          issues: parsed.error.issues,
        });
        return;
      }

      const user = await this.userService.create(parsed.data);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = routeParamId(req);
      if (!id) {
        res.status(400).json({ message: "User id is required" });
        return;
      }

      const user = await this.userService.findById(id);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.findAll();
      res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = routeParamId(req);
      if (!id) {
        res.status(400).json({ message: "User id is required" });
        return;
      }

      const parsed = updateUserBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          issues: parsed.error.issues,
        });
        return;
      }

      const user = await this.userService.update(id, parsed.data);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = routeParamId(req);
      if (!id) {
        res.status(400).json({ message: "User id is required" });
        return;
      }

      await this.userService.delete(id);
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
