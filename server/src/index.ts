import express from "express";
import { prisma } from "./db/prisma";
const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/db-health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ database: "connected" });
  } catch (err) {
    console.error(err);
    res.status(503).json({ database: "unavailable" });
  }
});

app.listen(port, () => {
  console.log(`Servidor em http://localhost:${port}`);
});
