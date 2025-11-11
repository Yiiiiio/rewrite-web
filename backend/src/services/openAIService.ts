import OpenAI from "openai";
import { config, isOpenAIConfigured } from "../config";
import type { RewriteRequestBody, RewriteResult } from "../types";

const openai = isOpenAIConfigured
  ? new OpenAI({
      apiKey: config.openAIApiKey
    })
  : null;

const MOCK_WARNING =
  "当前处于模拟模式，未实际调用 OpenAI。请配置 OPENAI_API_KEY 以启用真实改写。";

export async function performRewrite(
  payload: RewriteRequestBody
): Promise<RewriteResult> {
  const start = Date.now();
  if (!openai) {
    const result = mockRewrite(payload);
    return {
      ...result,
      warnings: [MOCK_WARNING, ...result.warnings],
      metrics: {
        ...result.metrics,
        latencyMs: Date.now() - start
      }
    };
  }

  const prompt = buildPrompt(payload);
  const response = await openai.responses.create({
    model: config.openAIModel,
    input: [
      {
        role: "system",
        content:
          "你是一名严谨的学术写作教练，需要在保持事实与引用准确的前提下改写文本，使其表达更自然、更具原创性。"
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: payload.temperature ?? 0.4,
    max_output_tokens: 1024
  });

  const text =
    response.output_text?.trim() ??
    response.output?.[0]?.content?.[0]?.text ??
    "";

  return {
    taskId: response.id,
    result: text,
    warnings: [],
    metrics: {
      wordCount: text.split(/\s+/).filter(Boolean).length,
      estimatedTokens: Math.ceil(text.length / 4),
      latencyMs: Date.now() - start
    }
  };
}

function buildPrompt(payload: RewriteRequestBody): string {
  const protectedTerms =
    payload.protectedTerms && payload.protectedTerms.length > 0
      ? `\n必须保持以下术语原样：${payload.protectedTerms.join(", ")}`
      : "";
  const citationRule = payload.keepCitations
    ? "\n保留原文中的引用格式（例如 [1]、(Smith, 2021)）。"
    : "";
  const lengthRule =
    payload.lengthPolicy === "shorter"
      ? "\n输出需略短（约 -10%）且重点突出。"
      : payload.lengthPolicy === "longer"
        ? "\n输出可略长（约 +10%），补充必要的学术连接用语。"
        : "\n长度保持大体一致。";

  const levelInstruction: Record<typeof payload.level, string> = {
    light:
      "以轻度改写方式输出，修正文法与语气，让语言更自然流畅，同时保持句式与结构不发生显著变化。",
    balance:
      "以平衡改写方式输出，保持核心论点与引用不变，可适度调整句式与段落结构，使表达更精炼与连贯。",
    heavy:
      "以重度改写方式输出，保持事实与论证逻辑不变，可以显著调整句式与词汇，创造更具原创性的表述。"
  };

  return `请按照以下要求改写文本：
${levelInstruction[payload.level]}${protectedTerms}${citationRule}${lengthRule}

【原文】:
${payload.originalText}`;
}

function mockRewrite(payload: RewriteRequestBody): RewriteResult {
  const prepend = `【模拟改写-${payload.level}】`;
  const resultText = `${prepend} ${payload.originalText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => `${index + 1}. ${line}`)
    .join("\n")}`;

  return {
    taskId: `mock-${Date.now()}`,
    result: resultText,
    warnings: ["示例输出仅用于前端联调，非真实模型结果。"],
    metrics: {
      wordCount: resultText.split(/\s+/).filter(Boolean).length,
      estimatedTokens: Math.ceil(resultText.length / 4),
      latencyMs: 0
    }
  };
}

