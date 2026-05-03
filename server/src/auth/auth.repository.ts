import type { PrismaClient } from "../../generated/prisma/client";
import type { CreateUserInput } from "../user/user.repository";
import { UserRepository } from "../user/user.repository";
import type { AuthUser } from "./auth.types";

export type { CreateUserInput };

export class AuthRepository {
  private readonly users: UserRepository;

  constructor(prisma: PrismaClient) {
    this.users = new UserRepository(prisma);
  }

  findUserByEmail(email: string): Promise<AuthUser | null> {
    return this.users.findByEmail(email);
  }

  findUserByNickname(nickname: string): Promise<AuthUser | null> {
    return this.users.findByNickname(nickname);
  }

  findUserById(id: string): Promise<AuthUser | null> {
    return this.users.findById(id);
  }

  createUser(input: CreateUserInput): Promise<AuthUser> {
    return this.users.create(input);
  }
}
