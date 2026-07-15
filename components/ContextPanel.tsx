"use client";

import { useState } from "react";
import { useSpeechRecognition, type SpeechLang } from "@/lib/useSpeechRecognition";
import styles from "./ContextPanel.module.css";

interface ContextPanelProps {
  value: string;
  onChange: (value: string) => void;
  lang: SpeechLang;
  dictationDisabled: boolean;
}

export function ContextPanel({ value, onChange, lang, dictationDisabled }: ContextPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const dictation = useSpeechRecognition({
    lang,
    onFinalChunk: (chunk) => {
      if (!chunk) return;
      onChange(value ? `${value} ${chunk}` : chunk);
    },
  });

  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsed : ""}`}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span>讲话背景</span>
        <span className={styles.chevron}>{collapsed ? "▴" : "▾"}</span>
      </button>

      {!collapsed && (
        <div className={styles.body}>
          <p className={styles.hint}>
            开讲前简单说说这段要讲什么、想达到什么目标——AI 会结合这段背景给建议，随时可以编辑。
          </p>
          <textarea
            className={styles.textarea}
            placeholder="例如：向团队汇报上季度销售数据，目标是让大家认可下季度的新策略"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
          />
          <div className={styles.actions}>
            {dictation.supported && (
              <button
                type="button"
                className={`${styles.micButton} ${dictation.listening ? styles.listening : ""}`}
                onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
                disabled={dictationDisabled}
                title={dictationDisabled ? "主字幕正在录音时不能同时用语音填背景" : undefined}
              >
                {dictation.listening ? "● 停止听写" : "🎤 语音输入"}
              </button>
            )}
            {value && (
              <button type="button" className={styles.clearButton} onClick={() => onChange("")}>
                清空
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
