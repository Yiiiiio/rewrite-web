import { Router } from "express";
import { rewriteRequestSchema } from "../types.js";
import { performRewrite } from "../services/openAIService.js";
import {
  createRewriteTask,
  updateRewriteTask,
  getRewriteTask,
  getUserRewriteHistory
} from "../services/rewriteTaskService.js";
import { logger } from "../utils/logger.js";

export const rewriteRouter = Router();

// 改写预览（会保存到数据库）
rewriteRouter.post("/preview", async (request, response) => {
  try {
    const payload = rewriteRequestSchema.parse(request.body);
    const userId = request.headers["x-user-id"] as string | undefined;

    // 创建任务记录
    const taskId = await createRewriteTask({
      userId,
      originalText: payload.originalText,
      level: payload.level,
      params: {
        temperature: payload.temperature,
        lengthPolicy: payload.lengthPolicy,
        protectedTerms: payload.protectedTerms,
        keepCitations: payload.keepCitations
      }
    });

    // 更新状态为处理中
    await updateRewriteTask(taskId, { status: "processing" });

    try {
      // 执行改写
      const result = await performRewrite(payload);

      // 保存结果
      await updateRewriteTask(taskId, {
        status: "completed",
        rewrittenText: result.rewrittenText,
        modelMeta: result.modelMeta
      });

      response.json({
        ...result,
        taskId
      });
    } catch (error) {
      // 保存错误信息
      await updateRewriteTask(taskId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "未知错误"
      });
      throw error;
    }
  } catch (error) {
    logger.error({ error }, "Rewrite preview failed");
    if (error instanceof Error) {
      response.status(400).json({ message: error.message });
      return;
    }
    response.status(500).json({ message: "未知错误，请稍后再试。" });
  }
});

// 获取改写任务详情
rewriteRouter.get("/task/:id", async (request, response) => {
  try {
    const taskId = request.params.id;
    const task = await getRewriteTask(taskId);
    if (!task) {
      response.status(404).json({ message: "任务不存在" });
      return;
    }
    response.json(task);
  } catch (error) {
    logger.error({ error }, "Get rewrite task failed");
    response.status(500).json({ message: "未知错误，请稍后再试。" });
  }
});

// 获取用户的改写历史
rewriteRouter.get("/history", async (request, response) => {
  try {
    const userId = request.headers["x-user-id"] as string | undefined;
    if (!userId) {
      response.status(401).json({ message: "需要用户身份" });
      return;
    }

    const limit = Number(request.query.limit) || 20;
    const offset = Number(request.query.offset) || 0;

    const history = await getUserRewriteHistory(userId, limit, offset);
    response.json(history);
  } catch (error) {
    logger.error({ error }, "Get rewrite history failed");
    response.status(500).json({ message: "未知错误，请稍后再试。" });
  }
});

