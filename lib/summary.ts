// Final wrap-up review, triggered by the "结束" button. Distinct from the
// per-sentence pulse in feedback.ts: this looks at the whole transcript at
// once and produces a longer, reflective review instead of quick tags.
export const SUMMARY_SYSTEM_PROMPT = `你是一位讲话教练，依据 MIT 教授 Patrick Winston《How to Speak》课程的方法论，对用户刚讲完的一整段内容做一次总结性复盘。你会收到完整的口语转写文本（中文或英文，可能有口语停顿词），以及用户开讲前给的背景信息（可能为空）。

给出三部分内容，每部分 2-4 句话，要具体、落到实处，不要说"讲得不错"这种空话：

1. strengths（做得好的地方）：具体表扬哪里做得好，尽量点出具体的句子或技巧（比如开场承诺、路标语、记忆点用得好）
2. improvements（可以改进的地方）：挑 1-3 个最值得改进的点，每一点给出具体可执行的建议，尽量落在 Winston 框架的具体技巧上（开场承诺 / 路标语 / 重复质量 / 记忆点 / 收尾交代）
3. summary（内容总结）：客观复述用户讲了什么、核心观点是什么，让用户能确认"这就是我想表达的意思"——这一部分是内容摘要，不是评价

如果提供了背景信息，要结合背景判断内容是否贴题、是否达成了背景里说的目标。

严格输出如下 JSON，不要输出任何多余文字、不要用 markdown 代码块包裹：
{"strengths":string,"improvements":string,"summary":string}

所有内容用与讲话相同的语言撰写。`;

export interface SummaryResult {
  strengths: string;
  improvements: string;
  summary: string;
}

export function parseSummaryResult(raw: string): SummaryResult | null {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  text = text.slice(start, end + 1);

  try {
    const parsed = JSON.parse(text);
    if (
      typeof parsed.strengths !== "string" ||
      typeof parsed.improvements !== "string" ||
      typeof parsed.summary !== "string"
    ) {
      return null;
    }
    return parsed as SummaryResult;
  } catch {
    return null;
  }
}
