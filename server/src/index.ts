import "dotenv/config";
import "./types/express-augmentation";
import cookieParser from "cookie-parser";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import type { PrismaClient } from "../generated/prisma/client";
import { PrismaClientSingleton } from "./db/prisma";
import { createRootRouter } from "./routes/router";

function parseAllowedOrigins(): Set<string> {
  const raw = process.env.WEB_ORIGIN ?? process.env.CORS_ORIGIN ?? "http://localhost:3001";
  return new Set(
    raw
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter((origin) => origin.length > 0)
  );
}

function corsMiddleware() {
  const allowedOrigins = parseAllowedOrigins();
  return function cors(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;
    if (typeof origin === "string" && allowedOrigins.has(origin.replace(/\/$/, ""))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PATCH,PUT,DELETE,OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Accept, Authorization, X-Requested-With"
      );
      res.setHeader("Access-Control-Max-Age", "600");
    }

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  };
}

class Application {
  private readonly app: Express;

  constructor(private readonly database: PrismaClient) {
    this.app = express();
    this.registerMiddleware();
    this.registerRoutes();
  }

  private registerMiddleware(): void {
    this.app.use(corsMiddleware());
    this.app.use(express.json());
    this.app.use(cookieParser());
  }

  private registerRoutes(): void {
    this.app.use(createRootRouter(this.database));
  }

  listen(port: number): void {
    const server = this.app.listen(port, () => {
      console.log(`Servidor em http://localhost:${port}`);
    });
    // Sem limite de inatividade no socket enquanto o handler aguarda o Ollama (resposta lenta).
    server.setTimeout(0);
  }
}

const port = Number(process.env.PORT) || 3000;
const prisma = PrismaClientSingleton.getInstance().prisma;

const app = new Application(prisma);

app.listen(port);
