export type RewriteLevel = "light" | "balance" | "heavy";

export type RewriteRequestPayload = {
  originalText: string;
  level: RewriteLevel;
  protectedTerms?: string[];
  temperature?: number;
  lengthPolicy?: "shorter" | "longer" | "keep";
  keepCitations?: boolean;
};

export type RewriteResponse = {
  taskId?: string;
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

