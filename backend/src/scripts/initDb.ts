import { getPrismaClient } from "../db/client.js";
import { logger } from "../utils/logger.js";

/**
 * 初始化数据库表（如果不存在）
 */
export async function initDatabase(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
      logger.warn("DATABASE_URL 未设置，跳过数据库初始化");
      return false;
    }

    const prisma = getPrismaClient();
    
    // 尝试查询一个表，如果表不存在会报错
    try {
      await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
      logger.info("数据库表已存在，跳过初始化");
      return true;
    } catch (error: any) {
      // 如果表不存在，执行 db push
      logger.info("检测到数据库表不存在，开始初始化...");
      
      // 使用 Prisma 的 db push（通过 exec 执行）
      const { execSync } = await import("child_process");
      execSync("npx prisma db push --skip-generate", {
        stdio: "inherit",
        env: process.env
      });
      
      logger.info("数据库初始化成功");
      return true;
    }
  } catch (error) {
    logger.error({ error }, "数据库初始化失败");
    return false;
  }
}

