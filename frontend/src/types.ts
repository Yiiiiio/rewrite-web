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
  taskId: string;
  result: string;
  warnings: string[];
  metrics: {
    wordCount: number;
    estimatedTokens: number;
    latencyMs: number;
  };
};

