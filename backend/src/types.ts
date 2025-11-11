import { z } from "zod";

export const rewriteRequestSchema = z.object({
  originalText: z.string().min(10, "原文内容至少 10 个字符"),
  level: z.enum(["light", "balance", "heavy"]),
  protectedTerms: z.array(z.string()).optional(),
  temperature: z.number().min(0).max(1).optional(),
  lengthPolicy: z.enum(["shorter", "longer", "keep"]).optional(),
  keepCitations: z.boolean().optional()
});

export type RewriteRequestBody = z.infer<typeof rewriteRequestSchema>;

export type RewriteResult = {
  taskId: string;
  result: string;
  warnings: string[];
  metrics: {
    wordCount: number;
    estimatedTokens: number;
    latencyMs: number;
  };
};

