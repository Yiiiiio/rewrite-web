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

export type RewriteLevel = "light" | "balance" | "heavy";

export type RewriteParams = {
  temperature?: number;
  lengthPolicy?: "shorter" | "longer" | "keep";
  protectedTerms?: string[];
  keepCitations?: boolean;
};

export type RewriteResult = {
  rewrittenText: string;
  warnings: string[];
  modelMeta?: {
    model: string;
    tokens?: number;
    cost?: number;
    latency?: number;
  };
  metrics: {
    wordCount: number;
    estimatedTokens: number;
    latencyMs: number;
  };
};

