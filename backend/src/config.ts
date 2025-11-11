import "dotenv/config";

const requiredEnv = ["OPENAI_API_KEY", "DATABASE_URL"] as const;

const missing = requiredEnv.filter(
  (key) => !process.env[key] || process.env[key]?.trim() === ""
);

export const isOpenAIConfigured = missing.length === 0;

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

