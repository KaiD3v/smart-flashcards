import { Router } from "express";
import type { PrismaClient } from "../../generated/prisma/client";
import {
  createRequireAuthMiddleware,
  requireProfileOwner,
} from "../auth/auth.middleware";
import type { AuthService } from "../auth/auth.service";
import { UserController } from "../user/user.controller";
import { UserRepository } from "../user/user.repository";
import { UserService } from "../user/user.service";

export function createUserRouter(
  prisma: PrismaClient,
  authService: AuthService,
  authCookieName: string
): Router {
  const repository = new UserRepository(prisma);
  const service = new UserService(repository);
  const controller = new UserController(service);

  const requireAuth = createRequireAuthMiddleware(authService, authCookieName);

  const router = Router();

  router.post("/", controller.create);
  router.get("/", controller.findAll);
  router.get("/:id", controller.findById);
  router.patch("/:id", requireAuth, requireProfileOwner, controller.update);
  router.delete("/:id", requireAuth, requireProfileOwner, controller.delete);

  router.use(UserController.handleError);

  return router;
}
