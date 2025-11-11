import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

// 单例模式，确保全局只有一个 Prisma 客户端实例
let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { level: "error", emit: "event" },
        { level: "warn", emit: "event" }
      ]
    });

    prisma.$on("error" as never, (e: { message: string }) => {
      logger.error({ error: e }, "Prisma error");
    });

    prisma.$on("warn" as never, (e: { message: string }) => {
      logger.warn({ warning: e }, "Prisma warning");
    });

    // 优雅关闭
    process.on("beforeExit", async () => {
      await prisma?.$disconnect();
    });
  }

  return prisma;
}

// 测试数据库连接
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    logger.info("Database connection successful");
    return true;
  } catch (error) {
    logger.error({ error }, "Database connection failed");
    return false;
  }
}

// 断开数据库连接（用于测试或关闭）
export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

