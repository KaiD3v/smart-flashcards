import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { LoginBody, RegisterBody } from "./auth.dto";
import { HttpError } from "./auth.errors";
import { AuthRepository } from "./auth.repository";
import type { AuthUser } from "./auth.types";

const BCRYPT_ROUNDS = 10;

export type PublicUser = Omit<AuthUser, "password">;

export type AuthTokens = {
  user: PublicUser;
  token: string;
};

type JwtPayload = {
  sub: string;
  email: string;
};

function toPublicUser(user: AuthUser): PublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: SignOptions["expiresIn"]
  ) {}

  private signAccessToken(user: AuthUser): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  async register(body: RegisterBody): Promise<AuthTokens> {
    const existingEmail = await this.repository.findUserByEmail(body.email);
    if (existingEmail) {
      throw new HttpError(409, "Email already registered");
    }

    const existingNickname = await this.repository.findUserByNickname(body.nickname);
    if (existingNickname) {
      throw new HttpError(409, "Nickname already taken");
    }

    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

    const user = await this.repository.createUser({
      email: body.email,
      nickname: body.nickname,
      name: body.name ?? null,
      passwordHash,
    });

    return {
      user: toPublicUser(user),
      token: this.signAccessToken(user),
    };
  }

  async login(body: LoginBody): Promise<AuthTokens> {
    const user = await this.repository.findUserByEmail(body.email);
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const match = await bcrypt.compare(body.password, user.password);
    if (!match) {
      throw new HttpError(401, "Invalid email or password");
    }

    return {
      user: toPublicUser(user),
      token: this.signAccessToken(user),
    };
  }

  async getUserFromAccessToken(token: string): Promise<PublicUser> {
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
    } catch {
      throw new HttpError(401, "Invalid or expired token");
    }

    const userId = typeof payload.sub === "string" ? payload.sub : undefined;
    if (!userId) {
      throw new HttpError(401, "Invalid or expired token");
    }

    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new HttpError(401, "User not found");
    }

    return toPublicUser(user);
  }
}
