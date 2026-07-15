// Coaching framework adapted from MIT Professor Patrick Winston's "How to
// Speak" lecture (open-source Claude skill reference:
// https://github.com/xeichelberger/how-to-speak-). Only the techniques that
// are observable from a live speech transcript are kept — room setup, slide
// design, etc. need video/visual input we don't have.
export const FEEDBACK_SYSTEM_PROMPT = `你是一位讲话教练，评估依据是 MIT 教授 Patrick Winston 那门经典课程《How to Speak》里的方法论。你会收到一段口语转写文本（中文或英文，可能不完整、有口语停顿词，可能只是整段讲话中间的一个片段）。只依据下面的技巧打分，不评价内容本身对不对：

先给一句 "overall" 点评：不管这段有没有踩到具体技巧，都必须给一句具体的话——讲得好就具体夸哪里好（比如"这句开场很干脆"），没有明显问题也简单说一句实际情况（比如"语速平稳，继续保持"），不能是空话、不能留空。这一项永远要有内容。

然后判断下面 5 个具体技巧：

1. opening_promise（开场承诺）：如果这段是讲话的开场部分，有没有先说清楚"听完这段你会得到什么"（Winston 说的 empowerment promise），而不是绕很久的寒暄、铺垫才进入正题
2. signposting（路标语）：有没有用"第一点""接下来""最后"这类清晰的结构词（verbal punctuation），帮听众在走神后能重新跟上讲话的骨架
3. repetition_quality（重复的质量）：关键意思是不是用不同的说法反复强调（Winston 推荐的 cycle on the subject，是好的重复）；还是在原地打转、换汤不换药地说了等于没说（这种才该被标记）
4. memorable_moment（记忆点）：这段有没有一个让人记得住的东西——一个故事、一个比喻、一个意外的事实，或者一句可以当口号的话（Winston 的 5 S's：Symbol / Slogan / Surprise / Salient idea / Story）
5. closing_contribution（收尾交代）：如果这段是讲话的结尾部分，有没有清楚说完"讲了什么、听众得到了什么"，而不是干巴巴地结束或者只说一句"谢谢"

只有在有把握、且这段文本确实提供了判断依据时才把这 5 项标记为 true。如果这段明显不是开场也不是结尾，opening_promise 和 closing_contribution 一律标记 false，不要牵强附会；文本太短或证据不足的维度也标记 false。

严格输出如下 JSON，不要输出任何多余文字、不要用 markdown 代码块包裹：
{"overall":string,"opening_promise":{"flag":boolean,"note":string},"signposting":{"flag":boolean,"note":string},"repetition_quality":{"flag":boolean,"note":string},"memorable_moment":{"flag":boolean,"note":string},"closing_contribution":{"flag":boolean,"note":string}}

overall：一定要填，不超过25个汉字或20个英文单词，用与输入文本相同的语言。
其余 5 个维度的 note 字段：flag 为 true 时，给一句具体可执行的建议，直接点名该用哪个技巧（不超过25个汉字或20个英文单词，比如"加一句'讲完这段你会知道…'的开场承诺"）；flag 为 false 时留空字符串 ""。
所有文字都用与输入文本相同的语言撰写。`;

export interface FeedbackDimension {
  flag: boolean;
  note: string;
}

export interface FeedbackResult {
  overall: string;
  opening_promise: FeedbackDimension;
  signposting: FeedbackDimension;
  repetition_quality: FeedbackDimension;
  memorable_moment: FeedbackDimension;
  closing_contribution: FeedbackDimension;
}

export type FlagDimensionKey = Exclude<keyof FeedbackResult, "overall">;

export interface Suggestion {
  id: string;
  dimension: keyof FeedbackResult;
  note: string;
  createdAt: number;
}

export const DIMENSION_LABELS: Record<keyof FeedbackResult, string> = {
  overall: "本段点评",
  opening_promise: "开场承诺",
  signposting: "路标语",
  repetition_quality: "重复质量",
  memorable_moment: "记忆点",
  closing_contribution: "收尾交代",
};

const FLAG_KEYS: FlagDimensionKey[] = [
  "opening_promise",
  "signposting",
  "repetition_quality",
  "memorable_moment",
  "closing_contribution",
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
    if (typeof parsed.overall !== "string" || parsed.overall.trim().length === 0) {
      return null;
    }
    for (const key of FLAG_KEYS) {
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
  const overall: Suggestion = {
    id: `${now}-overall`,
    dimension: "overall",
    note: result.overall,
    createdAt: now,
  };
  const flagged = FLAG_KEYS.filter((key) => result[key].flag).map((key, i) => ({
    id: `${now}-${key}-${i}`,
    dimension: key,
    note: result[key].note,
    createdAt: now,
  }));
  return [overall, ...flagged];
}
