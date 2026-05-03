import type { PrismaClient } from "../../generated/prisma/client";
import type { AuthUser } from "./auth.types";

export type CreateUserInput = {
  email: string;
  nickname: string;
  name: string | null;
  passwordHash: string;
};

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findUserByEmail(email: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
    }) as unknown as Promise<AuthUser | null>;
  }

  findUserByNickname(nickname: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { nickname } as never,
    }) as unknown as Promise<AuthUser | null>;
  }

  findUserById(id: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { id } as never,
    }) as unknown as Promise<AuthUser | null>;
  }

  createUser(input: CreateUserInput): Promise<AuthUser> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        nickname: input.nickname,
        name: input.name,
        password: input.passwordHash,
      } as never,
    }) as unknown as Promise<AuthUser>;
  }
}
