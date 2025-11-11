import express from "express";
import cors from "cors";
import { config, reportMissingEnv } from "./config";
import { logger } from "./utils/logger";
import { rewriteRouter } from "./routes/rewriteRoute";
import { testDatabaseConnection } from "./db/client.js";

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

app.listen(config.port, async () => {
  logger.info(
    { port: config.port, env: config.env },
    "Rewrite backend server is running"
  );
  
  // 测试数据库连接
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    logger.error("数据库连接失败，请检查 DATABASE_URL 环境变量");
  }

  const missingEnvMessage = reportMissingEnv();
  if (missingEnvMessage) {
    logger.warn(
      `${missingEnvMessage}，当前将返回模拟改写结果，供前端联调使用。`
    );
  }
});

