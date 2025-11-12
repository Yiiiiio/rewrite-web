import OpenAI from "openai";
import { config, isOpenAIConfigured } from "../config.js";
import type { RewriteRequestBody, RewriteResult } from "../types.js";

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
  const response = await openai.chat.completions.create({
    model: config.openAIModel,
    messages: [
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
    max_tokens: 2048
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";

  return {
    rewrittenText: text,
    warnings: [],
    modelMeta: {
      model: config.openAIModel,
      tokens: response.usage?.total_tokens,
      latency: Date.now() - start
    },
    metrics: {
      wordCount: text.split(/\s+/).filter(Boolean).length,
      estimatedTokens: response.usage?.total_tokens ?? Math.ceil(text.length / 4),
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
    light: `请把下面的文字改写得更自然、减少明显的 AI 痕迹，但不要破坏原有的逻辑与语法。
要求：
- 使用更常见的词汇和句式；
- 在保持清晰的同时，加入少量自然语气（例如 like、actually、also、I think）；
- 让句子结构顺畅，不出现明显的非母语痕迹；
- 保持原文含义不变。`,
    balance: `请改写下面的文字，让它更像人类写作而非 AI 生成。
要求：
- 语言自然流畅，不必完美；
- 使用简单的词汇，避免过于正式或复杂；
- 可以有轻微重复或不均匀的句式；
- 让长句和短句交替出现；
- 插入少量“人类语气词”，如 actually、in fact、I think、maybe；
- 核心信息保持不变。`,
    heavy: `请深度改写下面的文字，让它几乎看不出 AI 痕迹。
要求：
- 用人类思维方式表达，可以稍显随意，甚至出现轻微的逻辑跳跃；
- 避免整齐或过于完美的句式；
- 使用简单自然的词汇，多用口语表达，尽量少用 moreover、thus、therefore 等词；
- 可以保留少量语法不对称或轻微的非母语用法；
- 模仿普通作者或硕士生写作的语感；
- 让整段文字读起来像“思考中写”，而不是模型直接生成。`
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
    rewrittenText: resultText,
    warnings: ["示例输出仅用于前端联调，非真实模型结果。"],
    modelMeta: {
      model: "mock",
      latency: 0
    },
    metrics: {
      wordCount: resultText.split(/\s+/).filter(Boolean).length,
      estimatedTokens: Math.ceil(resultText.length / 4),
      latencyMs: 0
    }
  };
}

