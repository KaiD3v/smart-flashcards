import type { CookieOptions, NextFunction, Request, Response } from "express";
import { loginBodySchema, registerBodySchema } from "./auth.dto";
import { HttpError } from "./auth.errors";
import type { AuthService } from "./auth.service";

function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieName: string,
    private readonly cookieOptions: CookieOptions
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = registerBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          issues: parsed.error.issues,
        });
        return;
      }

      const { user, token } = await this.authService.register(parsed.data);
      res.cookie(this.cookieName, token, this.cookieOptions);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = loginBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          message: "Validation failed",
          issues: parsed.error.issues,
        });
        return;
      }

      const { user, token } = await this.authService.login(parsed.data);
      res.cookie(this.cookieName, token, this.cookieOptions);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response): void => {
    res.clearCookie(this.cookieName, {
      path: this.cookieOptions.path ?? "/",
      httpOnly: this.cookieOptions.httpOnly,
      secure: this.cookieOptions.secure,
      sameSite: this.cookieOptions.sameSite,
    });
    res.status(204).send();
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies[this.cookieName] as string | undefined;
      if (!token) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      const user = await this.authService.getUserFromAccessToken(token);
      res.status(200).json({ user });
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
