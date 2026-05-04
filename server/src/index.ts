import "dotenv/config";
import "./types/express-augmentation";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import type { PrismaClient } from "../generated/prisma/client";
import { PrismaClientSingleton } from "./db/prisma";
import { createRootRouter } from "./routes/router";

class Application {
  private readonly app: Express;

  constructor(private readonly database: PrismaClient) {
    this.app = express();
    this.registerMiddleware();
    this.registerRoutes();
  }

  private registerMiddleware(): void {
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
