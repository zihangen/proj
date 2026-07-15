import type { FeedbackResult } from "./feedback";
import type { SummaryResult } from "./summary";

export class AnalyzeError extends Error {}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new AnalyzeError(data?.error ?? `请求失败（${res.status}）`);
  }

  return data as T;
}

export async function analyzeTranscript(
  modelId: string,
  apiKey: string,
  transcriptChunk: string,
  context: string
): Promise<FeedbackResult> {
  return postJson<FeedbackResult>("/api/analyze", {
    modelId,
    apiKey,
    transcript: transcriptChunk,
    context,
  });
}

export async function requestSummary(
  modelId: string,
  apiKey: string,
  transcript: string,
  context: string
): Promise<SummaryResult> {
  return postJson<SummaryResult>("/api/summary", { modelId, apiKey, transcript, context });
}
