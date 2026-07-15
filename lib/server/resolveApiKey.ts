import type { CuratedModel } from "@/lib/models";

export interface ResolvedKey {
  key: string;
}

export interface ResolveKeyError {
  error: string;
  status: number;
}

export function resolveApiKey(model: CuratedModel, userApiKey?: string): ResolvedKey | ResolveKeyError {
  if (model.requiresKey) {
    const key = userApiKey?.trim();
    if (!key) {
      return { error: "这个模型需要你自己的 OpenRouter API Key，请在设置里填写", status: 400 };
    }
    return { key };
  }

  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    return {
      error: "网站还没配置免费模型的 API Key（OPENROUTER_API_KEY 环境变量缺失或是空的）",
      status: 500,
    };
  }
  return { key };
}

export function is401Error(model: CuratedModel): string {
  return model.requiresKey
    ? "你在设置里填的 OpenRouter API Key 好像不对，检查一下有没有多余的空格或复制错了。"
    : "网站配置的 OPENROUTER_API_KEY 好像不对，去 Vercel 的环境变量里检查一下有没有多余的空格/换行。";
}
