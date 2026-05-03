import type { PrismaClient } from "../../generated/prisma/client";
import type { UserEntity } from "./user.types";

export type CreateUserInput = {
  email: string;
  nickname: string;
  name: string | null;
  passwordHash: string;
};

export type UpdateUserInput = {
  email?: string;
  nickname?: string;
  name?: string | null;
  passwordHash?: string;
};

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByNickname(nickname: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { nickname } });
  }

  findMany(): Promise<UserEntity[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  }

  create(input: CreateUserInput): Promise<UserEntity> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        nickname: input.nickname,
        name: input.name,
        password: input.passwordHash,
      },
    });
  }

  update(id: string, input: UpdateUserInput): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.nickname !== undefined ? { nickname: input.nickname } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.passwordHash !== undefined ? { password: input.passwordHash } : {}),
      },
    });
  }

  delete(id: string): Promise<UserEntity> {
    return this.prisma.user.delete({ where: { id } });
  }
}
