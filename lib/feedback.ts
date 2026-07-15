export const FEEDBACK_SYSTEM_PROMPT = `你是一位表达教练，会收到一段口语转写文本（中文或英文，可能不完整、有口语停顿词）。
只评估表达结构，不评价内容对错，只关注四个维度：

1. opening_too_long：开场铺垫是否过长，迟迟不进入正题
2. circular：是否在绕圈子，反复说同一件事而没有推进
3. no_conclusion：这段话是否缺少明确的结论或行动点
4. logic_jump：论证之间是否有明显跳跃，让人跟不上

只有在有把握时才把某个维度标记为 true；证据不足、文本太短，或只是正常停顿，一律标记 false。

严格输出如下 JSON，不要输出任何多余文字、不要用 markdown 代码块包裹：
{"opening_too_long":{"flag":boolean,"note":string},"circular":{"flag":boolean,"note":string},"no_conclusion":{"flag":boolean,"note":string},"logic_jump":{"flag":boolean,"note":string}}

note 字段：flag 为 true 时，用一句具体、可执行的建议（不超过25个汉字或20个英文单词）；flag 为 false 时留空字符串 ""。
note 使用与输入文本相同的语言撰写。`;

export interface FeedbackDimension {
  flag: boolean;
  note: string;
}

export interface FeedbackResult {
  opening_too_long: FeedbackDimension;
  circular: FeedbackDimension;
  no_conclusion: FeedbackDimension;
  logic_jump: FeedbackDimension;
}

export interface Suggestion extends FeedbackDimension {
  id: string;
  dimension: keyof FeedbackResult;
  createdAt: number;
}

export const DIMENSION_LABELS: Record<keyof FeedbackResult, string> = {
  opening_too_long: "铺垫过长",
  circular: "车轱辘话",
  no_conclusion: "缺少结论",
  logic_jump: "逻辑跳跃",
};

const REQUIRED_KEYS: (keyof FeedbackResult)[] = [
  "opening_too_long",
  "circular",
  "no_conclusion",
  "logic_jump",
];

export function parseFeedbackResult(raw: string): FeedbackResult | null {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  text = text.slice(start, end + 1);

  try {
    const parsed = JSON.parse(text);
    for (const key of REQUIRED_KEYS) {
      const dim = parsed[key];
      if (!dim || typeof dim.flag !== "boolean" || typeof dim.note !== "string") {
        return null;
      }
    }
    return parsed as FeedbackResult;
  } catch {
    return null;
  }
}

export function resultToSuggestions(result: FeedbackResult): Suggestion[] {
  const now = Date.now();
  return REQUIRED_KEYS.filter((key) => result[key].flag).map((key, i) => ({
    id: `${now}-${key}-${i}`,
    dimension: key,
    flag: result[key].flag,
    note: result[key].note,
    createdAt: now,
  }));
}
