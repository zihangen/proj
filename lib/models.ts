export interface CuratedModel {
  id: string;
  label: string;
  free: boolean;
  requiresKey: boolean;
}

// OpenRouter's free-tier lineup changes over time — this app already hit a
// retired slug once (deepseek-r1:free -> 404, "use deepseek/deepseek-r1
// instead"). If one of the two free entries below starts 404ing, swap the
// id for a current one from https://openrouter.ai/models?max_price=0.
export const CURATED_MODELS: CuratedModel[] = [
  {
    id: "deepseek/deepseek-chat-v3.1:free",
    label: "DeepSeek（免费，无需 Key）",
    free: true,
    requiresKey: false,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B（免费，无需 Key）",
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
