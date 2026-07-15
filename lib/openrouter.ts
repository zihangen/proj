import { FEEDBACK_SYSTEM_PROMPT, parseFeedbackResult, type FeedbackResult } from "./feedback";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export interface OpenRouterModel {
  id: string;
  name: string;
  free: boolean;
}

export const FALLBACK_FREE_MODELS: OpenRouterModel[] = [
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (free)", free: true },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (free)", free: true },
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (free)", free: true },
  { id: "qwen/qwen-2.5-72b-instruct:free", name: "Qwen 2.5 72B (free)", free: true },
];

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  try {
    const res = await fetch(`${OPENROUTER_BASE}/models`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const models: OpenRouterModel[] = (data.data ?? []).map(
      (m: { id: string; name?: string; pricing?: { prompt?: string } }) => ({
        id: m.id,
        name: m.name ?? m.id,
        free: m.pricing?.prompt === "0",
      })
    );
    return models
      .sort((a, b) => Number(b.free) - Number(a.free) || a.name.localeCompare(b.name))
      .slice(0, 80);
  } catch {
    return FALLBACK_FREE_MODELS;
  }
}

export class OpenRouterError extends Error {}

export async function analyzeTranscript(
  apiKey: string,
  model: string,
  transcriptChunk: string
): Promise<FeedbackResult> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Speech Coach",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: FEEDBACK_SYSTEM_PROMPT },
        { role: "user", content: transcriptChunk },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new OpenRouterError(`OpenRouter ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (!content) throw new OpenRouterError("empty response from model");

  const parsed = parseFeedbackResult(content);
  if (!parsed) throw new OpenRouterError("model did not return valid JSON");
  return parsed;
}
