import express from "express";
import cors from "cors";
import { config, reportMissingEnv } from "./config";
import { logger } from "./utils/logger";
import { rewriteRouter } from "./routes/rewriteRoute";
import { testDatabaseConnection } from "./db/client.js";
import { initDatabase } from "./scripts/initDb.js";

// 全局错误处理
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  logger.error({ error }, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  logger.error({ reason, promise }, "Unhandled Rejection");
});

// 启动时输出基本信息
logger.info({ 
  nodeVersion: process.version,
  env: config.env,
  port: process.env.PORT || config.port
}, "Starting server...");

const app = express();

// CORS 配置：允许 Vercel 前端域名
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // 允许无 origin 的请求（如移动应用或 Postman）
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: "32mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    env: config.env,
    openAI: reportMissingEnv() ? "mock" : "ready"
  });
});

app.use("/api/rewrite", rewriteRouter);

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error(error, "Unhandled error");
    res.status(500).json({ message: "服务器内部错误，请稍后再试。" });
  }
);

// Railway 会自动设置 PORT 环境变量
const port = process.env.PORT ? Number(process.env.PORT) : config.port;

// 启动服务器
async function startServer() {
  try {
    // 在启动前尝试初始化数据库（不阻塞启动）
    if (process.env.AUTO_INIT_DB !== "false") {
      initDatabase().catch((error) => {
        logger.warn({ error }, "数据库自动初始化失败，服务将继续启动");
      });
    }

    app.listen(port, "0.0.0.0", () => {
      logger.info(
        { port, env: config.env },
        "Rewrite backend server is running"
      );
      
      // 异步测试数据库连接（不阻塞启动）
      testDatabaseConnection().then((dbConnected) => {
        if (!dbConnected) {
          logger.warn("数据库连接失败，请检查 DATABASE_URL 环境变量。某些功能可能不可用。");
        } else {
          logger.info("数据库连接成功");
        }
      }).catch((error) => {
        logger.error({ error }, "数据库连接测试出错");
      });

      const missingEnvMessage = reportMissingEnv();
      if (missingEnvMessage) {
        logger.warn(
          `${missingEnvMessage}，当前将返回模拟改写结果，供前端联调使用。`
        );
      }
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

startServer();

