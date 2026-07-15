"use client";

import { DIMENSION_LABELS, type Suggestion } from "@/lib/feedback";
import styles from "./FeedbackPanel.module.css";

interface FeedbackPanelProps {
  enabled: boolean;
  keyMissing: boolean;
  suggestions: Suggestion[];
  analyzing: boolean;
  error: string | null;
}

export function FeedbackPanel({
  enabled,
  keyMissing,
  suggestions,
  analyzing,
  error,
}: FeedbackPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.title}>表达建议</span>
        {analyzing && <span className={styles.analyzing}>分析中…</span>}
      </div>

      {!enabled && <p className={styles.empty}>勾选顶部的“表达反馈”后，会在你停顿时给出建议。</p>}

      {enabled && keyMissing && (
        <p className={styles.empty}>你选的这个模型是付费的，需要先在设置里填写你自己的 OpenRouter API Key。</p>
      )}

      {enabled && !keyMissing && (
        <>
          {error && <p className={styles.error}>{error}</p>}
          {suggestions.length === 0 && !error && (
            <p className={styles.empty}>开始说话，停顿时会在这里出现建议。</p>
          )}
          <ul className={styles.list}>
            {suggestions.map((s) => (
              <li
                key={s.id}
                className={s.dimension === "overall" ? styles.cardOverall : styles.card}
              >
                <span className={s.dimension === "overall" ? styles.labelOverall : styles.label}>
                  {DIMENSION_LABELS[s.dimension]}
                </span>
                <p className={styles.note}>{s.note}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
