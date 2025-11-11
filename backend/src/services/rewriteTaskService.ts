import { getPrismaClient } from "../db/client.js";
import type { RewriteLevel, RewriteParams } from "../types.js";

export interface CreateRewriteTaskParams {
  userId?: string;
  originalText: string;
  level: RewriteLevel;
  params?: RewriteParams;
}

export interface UpdateRewriteTaskParams {
  rewrittenText?: string;
  status?: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  modelMeta?: {
    model: string;
    tokens?: number;
    cost?: number;
    latency?: number;
  };
}

/**
 * 创建改写任务记录
 */
export async function createRewriteTask(
  params: CreateRewriteTaskParams
): Promise<string> {
  const prisma = getPrismaClient();
  const task = await prisma.rewritingTask.create({
    data: {
      userId: params.userId,
      originalText: params.originalText,
      level: params.level,
      params: params.params as any,
      status: "pending"
    }
  });
  return task.id;
}

/**
 * 更新改写任务结果
 */
export async function updateRewriteTask(
  taskId: string,
  updates: UpdateRewriteTaskParams
): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.rewritingTask.update({
    where: { id: taskId },
    data: {
      ...updates,
      completedAt: updates.status === "completed" ? new Date() : undefined,
      updatedAt: new Date()
    }
  });
}

/**
 * 获取改写任务
 */
export async function getRewriteTask(taskId: string) {
  const prisma = getPrismaClient();
  return await prisma.rewritingTask.findUnique({
    where: { id: taskId }
  });
}

/**
 * 获取用户的改写历史
 */
export async function getUserRewriteHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  const prisma = getPrismaClient();
  const [tasks, total] = await Promise.all([
    prisma.rewritingTask.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        originalText: true,
        rewrittenText: true,
        level: true,
        status: true,
        createdAt: true,
        completedAt: true,
        modelMeta: true
      }
    }),
    prisma.rewritingTask.count({ where: { userId } })
  ]);

  return { tasks, total };
}

