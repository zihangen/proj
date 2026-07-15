import type { FeedbackResult } from "./feedback";

export class AnalyzeError extends Error {}

export async function analyzeTranscript(
  modelId: string,
  apiKey: string,
  transcriptChunk: string
): Promise<FeedbackResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelId, apiKey, transcript: transcriptChunk }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new AnalyzeError(data?.error ?? `请求失败（${res.status}）`);
  }

  return data as FeedbackResult;
}
