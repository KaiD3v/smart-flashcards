import bcrypt from "bcrypt";
import type { CreateUserBody, UpdateUserBody } from "./user.dto";
import { HttpError } from "../auth/auth.errors";
import {
  UserRepository,
  type CreateUserInput,
  type UpdateUserInput,
} from "./user.repository";
import type { PublicUser, UserEntity } from "./user.types";

const BCRYPT_ROUNDS = 10;

function toPublicUser(user: UserEntity): PublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async create(body: CreateUserBody): Promise<PublicUser> {
    const existingEmail = await this.repository.findByEmail(body.email);
    if (existingEmail) {
      throw new HttpError(409, "Email already registered");
    }

    const existingNickname = await this.repository.findByNickname(body.nickname);
    if (existingNickname) {
      throw new HttpError(409, "Nickname already taken");
    }

    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

    const input: CreateUserInput = {
      email: body.email,
      nickname: body.nickname,
      name: body.name ?? null,
      passwordHash,
    };

    const user = await this.repository.create(input);
    return toPublicUser(user);
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return toPublicUser(user);
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.repository.findMany();
    return users.map(toPublicUser);
  }

  async update(id: string, body: UpdateUserBody): Promise<PublicUser> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new HttpError(404, "User not found");
    }

    if (body.email !== undefined && body.email !== existing.email) {
      const taken = await this.repository.findByEmail(body.email);
      if (taken) {
        throw new HttpError(409, "Email already registered");
      }
    }

    if (body.nickname !== undefined && body.nickname !== existing.nickname) {
      const taken = await this.repository.findByNickname(body.nickname);
      if (taken) {
        throw new HttpError(409, "Nickname already taken");
      }
    }

    const patch: UpdateUserInput = {
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.nickname !== undefined ? { nickname: body.nickname } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
    };

    if (body.password !== undefined) {
      patch.passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    }

    const user = await this.repository.update(id, patch);
    return toPublicUser(user);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new HttpError(404, "User not found");
    }
    await this.repository.delete(id);
  }
}
