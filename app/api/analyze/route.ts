import { NextResponse } from "next/server";
import { FEEDBACK_SYSTEM_PROMPT, parseFeedbackResult } from "@/lib/feedback";
import { getModel } from "@/lib/models";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

interface AnalyzeRequestBody {
  modelId?: string;
  transcript?: string;
  apiKey?: string;
}

export async function POST(request: Request) {
  let body: AnalyzeRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不对" }, { status: 400 });
  }

  const { modelId, transcript, apiKey } = body;
  if (!modelId || !transcript) {
    return NextResponse.json({ error: "缺少 modelId 或 transcript" }, { status: 400 });
  }

  const model = getModel(modelId);
  if (!model) {
    return NextResponse.json({ error: "不认识的模型" }, { status: 400 });
  }

  let key: string | undefined;
  if (model.requiresKey) {
    key = apiKey?.trim();
    if (!key) {
      return NextResponse.json(
        { error: "这个模型需要你自己的 OpenRouter API Key，请在设置里填写" },
        { status: 400 }
      );
    }
  } else {
    key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "网站还没配置免费模型的 API Key（缺少 OPENROUTER_API_KEY 环境变量）" },
        { status: 500 }
      );
    }
  }

  const upstream = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Title": "Speech Coach",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: FEEDBACK_SYSTEM_PROMPT },
        { role: "user", content: transcript },
      ],
      temperature: 0.2,
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `OpenRouter ${upstream.status}: ${text.slice(0, 300)}` },
      { status: 502 }
    );
  }

  const data = await upstream.json();
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "模型没有返回内容" }, { status: 502 });
  }

  const parsed = parseFeedbackResult(content);
  if (!parsed) {
    return NextResponse.json({ error: "模型返回的内容不是预期的 JSON 格式" }, { status: 502 });
  }

  return NextResponse.json(parsed);
}
