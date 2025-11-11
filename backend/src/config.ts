import "dotenv/config";

// 检查必需的环境变量（但不阻止启动）
const requiredEnv = ["OPENAI_API_KEY", "DATABASE_URL"] as const;

const missing = requiredEnv.filter(
  (key) => !process.env[key] || process.env[key]?.trim() === ""
);

export const isOpenAIConfigured = 
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== "";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  env: process.env.NODE_ENV ?? "development",
  openAIApiKey: process.env.OPENAI_API_KEY ?? "",
  openAIModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  allowMock: process.env.ALLOW_MOCK === "true" || !isOpenAIConfigured,
  logLevel: process.env.LOG_LEVEL ?? "info",
  databaseUrl: process.env.DATABASE_URL ?? ""
} as const;

export function reportMissingEnv(): string | null {
  if (missing.length === 0) {
    return null;
  }
  return `Missing required environment variables: ${missing.join(", ")}`;
}

