import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./auth.errors";
import type { AuthService } from "./auth.service";
import { routeParamId } from "../http/route-params";

export function createRequireAuthMiddleware(authService: AuthService, cookieName: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies[cookieName] as string | undefined;
      if (!token) {
        next(new HttpError(401, "Not authenticated"));
        return;
      }

      const user = await authService.getUserFromAccessToken(token);
      req.authUser = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Ensures `:id` matches the authenticated user. Run after `createRequireAuthMiddleware`.
 */
export function requireProfileOwner(req: Request, res: Response, next: NextFunction): void {
  const authUser = req.authUser;
  if (!authUser) {
    next(new HttpError(401, "Not authenticated"));
    return;
  }

  const targetId = routeParamId(req, "id");
  if (!targetId || targetId !== authUser.id) {
    next(new HttpError(403, "You can only modify your own profile"));
    return;
  }

  next();
}
