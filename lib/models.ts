export interface CuratedModel {
  id: string;
  label: string;
  free: boolean;
  requiresKey: boolean;
}

// OpenRouter's free-tier lineup changes over time and models get retired
// with only a few days' notice (check the "Going away <date>" flag on
// https://openrouter.ai/models?max_price=0 before picking one). This app
// has already hit two retirements: deepseek-r1:free (404, paid-only now)
// and llama-3.3-70b-instruct:free (flagged "Going away July 19, 2026").
// DeepSeek currently has no free models on OpenRouter at all, so both free
// slots below come from other vendors; DeepSeek stays in the paid slot.
export const CURATED_MODELS: CuratedModel[] = [
  {
    id: "openai/gpt-oss-20b:free",
    label: "OpenAI gpt-oss-20b（免费，无需 Key）",
    free: true,
    requiresKey: false,
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    label: "Google Gemma 4 26B（免费，无需 Key）",
    free: true,
    requiresKey: false,
  },
  {
    id: "deepseek/deepseek-chat",
    label: "DeepSeek（付费，需要你自己的 Key）",
    free: false,
    requiresKey: true,
  },
  {
    id: "openai/gpt-4.1-mini",
    label: "OpenAI GPT-4.1 mini（付费，需要你自己的 Key）",
    free: false,
    requiresKey: true,
  },
];

export const DEFAULT_MODEL_ID = CURATED_MODELS[0].id;

export function getModel(id: string): CuratedModel | undefined {
  return CURATED_MODELS.find((m) => m.id === id);
}
