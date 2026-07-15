"use client";

import { useCallback, useState } from "react";
import { requestSummary, AnalyzeError } from "./openrouter";
import type { SummaryResult } from "./summary";

interface UseSessionSummaryResult {
  result: SummaryResult | null;
  loading: boolean;
  error: string | null;
  run: (modelId: string, apiKey: string, transcript: string, context: string) => Promise<void>;
  clear: () => void;
}

export function useSessionSummary(): UseSessionSummaryResult {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (modelId: string, apiKey: string, transcript: string, context: string) => {
      if (!transcript.trim()) {
        setError("还没有讲话内容，说点什么再结束吧。");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const summary = await requestSummary(modelId, apiKey, transcript, context);
        setResult(summary);
      } catch (err) {
        setError(err instanceof AnalyzeError ? err.message : "总结请求失败，请检查网络");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, run, clear };
}
