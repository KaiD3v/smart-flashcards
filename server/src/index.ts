import express, { type Express, type Request, type Response } from "express";
import type { PrismaClient } from "../generated/prisma/client";
import { PrismaClientSingleton } from "./db/prisma";

class Application {
  private readonly app: Express;

  constructor(private readonly database: PrismaClient) {
    this.app = express();
    this.registerMiddleware();
    this.registerRoutes();
  }

  private registerMiddleware(): void {
    this.app.use(express.json());
  }

  private registerRoutes(): void {
    this.app.get("/health", (_req: Request, res: Response) => {
      res.json({ status: "ok" });
    });

    this.app.get("/db-health", async (_req: Request, res: Response) => {
      try {
        await this.database.$queryRaw`SELECT 1`;
        res.json({ database: "connected" });
      } catch (err) {
        console.error(err);
        res.status(503).json({ database: "unavailable" });
      }
    });
  }

  listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Servidor em http://localhost:${port}`);
    });
  }
}

const port = Number(process.env.PORT) || 3000;
const prisma = PrismaClientSingleton.getInstance().prisma;

const app = new Application(prisma);
app.listen(port);
