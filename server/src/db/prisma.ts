import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export class PrismaClientSingleton {
  private static instance: PrismaClientSingleton | null = null;

  private readonly client: PrismaClient;

  private constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not defined");
    }

    const adapter = new PrismaPg({ connectionString });
    this.client = new PrismaClient({ adapter });
  }

  static getInstance(): PrismaClientSingleton {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClientSingleton();
    }
    return PrismaClientSingleton.instance;
  }

  get prisma(): PrismaClient {
    return this.client;
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}

export const prisma = PrismaClientSingleton.getInstance().prisma;
