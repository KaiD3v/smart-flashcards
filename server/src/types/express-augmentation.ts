import type { PublicUser } from "../auth/auth.service";

declare global {
  namespace Express {
    interface Request {
      /** Set by `createRequireAuthMiddleware` after a valid session cookie. */
      authUser?: PublicUser;
    }
  }
}

export {};
