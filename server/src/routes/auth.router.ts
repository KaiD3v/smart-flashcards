import { Router, type CookieOptions } from "express";
import type { SignOptions } from "jsonwebtoken";
import type { PrismaClient } from "../../generated/prisma/client";
import { AuthController } from "../auth/auth.controller";
import { AuthRepository } from "../auth/auth.repository";
import { AuthService } from "../auth/auth.service";

const DEFAULT_JWT_EXPIRES: SignOptions["expiresIn"] = "7d";
const DEFAULT_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const SAME_SITE_VALUES = new Set(["lax", "strict", "none"] as const);

function resolveCookieOptions(): CookieOptions {
  const secure = process.env.NODE_ENV === "production";
  const sameSiteRaw = process.env.AUTH_COOKIE_SAME_SITE?.toLowerCase();
  const sameSite =
    sameSiteRaw && SAME_SITE_VALUES.has(sameSiteRaw as "lax" | "strict" | "none")
      ? (sameSiteRaw as "lax" | "strict" | "none")
      : "lax";

  // Browsers require Secure when SameSite=None.
  const effectiveSecure = sameSite === "none" ? true : secure;

  return {
    httpOnly: true,
    secure: effectiveSecure,
    sameSite,
    path: "/",
    maxAge: Number(process.env.JWT_COOKIE_MAX_AGE_MS) || DEFAULT_COOKIE_MAX_AGE_MS,
  };
}

export type AuthRouterBundle = {
  router: Router;
  authService: AuthService;
  cookieName: string;
};

export function createAuthRouter(prisma: PrismaClient): AuthRouterBundle {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required for auth routes");
  }

  const jwtExpiresIn: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? DEFAULT_JWT_EXPIRES;

  const cookieName = process.env.AUTH_COOKIE_NAME ?? "access_token";

  const repository = new AuthRepository(prisma);
  const authService = new AuthService(repository, jwtSecret, jwtExpiresIn);
  const controller = new AuthController(authService, cookieName, resolveCookieOptions());

  const router = Router();

  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.post("/logout", controller.logout);
  router.get("/me", controller.me);

  router.use(AuthController.handleError);

  return { router, authService, cookieName };
}
