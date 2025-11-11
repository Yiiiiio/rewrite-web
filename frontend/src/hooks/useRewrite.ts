import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { apiClient } from "../services/apiClient";
import type { RewriteRequestPayload, RewriteResponse } from "../types";

type RewriteConfig = {
  temperature: number;
  lengthPolicy: "shorter" | "longer" | "keep";
  keepCitations: boolean;
};

const DEFAULT_CONFIG: RewriteConfig = {
  temperature: 0.4,
  lengthPolicy: "keep",
  keepCitations: true
};

export type HistoryEntry = {
  id: string;
  createdAt: string;
  level: RewriteRequestPayload["level"];
  wordCount: number;
  originalPreview: string;
  resultPreview: string;
};

export function useRewrite() {
  const [config, setConfig] = useState<RewriteConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const mutation = useMutation({
    mutationFn: async (payload: RewriteRequestPayload) => {
      if (!payload.originalText.trim()) {
        throw new Error("请输入需要改写的原文内容。");
      }
      const response = await apiClient.post<RewriteResponse>(
        "/rewrite/preview",
        {
          ...payload,
          temperature: payload.temperature ?? config.temperature,
          lengthPolicy: payload.lengthPolicy ?? config.lengthPolicy,
          keepCitations: payload.keepCitations ?? config.keepCitations
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      setHistory((current) =>
        [
          {
            id: data.taskId,
            createdAt: new Date().toISOString(),
            level: variables.level,
            wordCount: data.metrics.wordCount,
            originalPreview: variables.originalText.slice(0, 120),
            resultPreview: data.result.slice(0, 120)
          },
          ...current
        ].slice(0, 10)
      );
    }
  });

  return useMemo(
    () => ({
      mutate: mutation.mutate,
      isLoading: mutation.isPending,
      data: mutation.data ?? null,
      reset: mutation.reset,
      history,
      config,
      setConfig
    }),
    [mutation, history, config]
  );
}

