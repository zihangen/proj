import { NextResponse } from "next/server";
import { SUMMARY_SYSTEM_PROMPT, parseSummaryResult } from "@/lib/summary";
import { getModel } from "@/lib/models";
import { resolveApiKey, is401Error } from "@/lib/server/resolveApiKey";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
// Keep the tail of very long sessions rather than sending unbounded text.
const MAX_TRANSCRIPT_CHARS = 12000;

interface SummaryRequestBody {
  modelId?: string;
  transcript?: string;
  apiKey?: string;
  context?: string;
}

export async function POST(request: Request) {
  let body: SummaryRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不对" }, { status: 400 });
  }

  const { modelId, transcript, apiKey, context } = body;
  if (!modelId || !transcript?.trim()) {
    return NextResponse.json({ error: "缺少 modelId 或 transcript" }, { status: 400 });
  }

  const model = getModel(modelId);
  if (!model) {
    return NextResponse.json({ error: "不认识的模型" }, { status: 400 });
  }

  const resolved = resolveApiKey(model, apiKey);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const messages = [{ role: "system", content: SUMMARY_SYSTEM_PROMPT }];
  if (context?.trim()) {
    messages.push({ role: "system", content: `讲话背景（用户提供）：\n${context.trim()}` });
  }
  messages.push({ role: "user", content: transcript.trim().slice(-MAX_TRANSCRIPT_CHARS) });

  const upstream = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resolved.key}`,
      "Content-Type": "application/json",
      "X-Title": "Speech Coach",
    },
    body: JSON.stringify({ model: modelId, messages, temperature: 0.3 }),
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    if (upstream.status === 401) {
      return NextResponse.json(
        { error: `${is401Error(model)}（OpenRouter: ${text.slice(0, 200)}）` },
        { status: 502 }
      );
    }
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

  const parsed = parseSummaryResult(content);
  if (!parsed) {
    return NextResponse.json({ error: "模型返回的内容不是预期的 JSON 格式" }, { status: 502 });
  }

  return NextResponse.json(parsed);
}
