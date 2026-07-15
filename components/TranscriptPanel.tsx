"use client";

import { useEffect, useRef } from "react";
import styles from "./TranscriptPanel.module.css";

interface TranscriptPanelProps {
  finalText: string;
  interimText: string;
  listening: boolean;
  supported: boolean;
}

export function TranscriptPanel({
  finalText,
  interimText,
  listening,
  supported,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [finalText, interimText]);

  if (!supported) {
    return (
      <div className={styles.panel}>
        <div className={styles.unsupported}>
          <p>当前浏览器不支持实时语音识别。</p>
          <p>请使用最新版 Chrome、Edge 或 Safari 打开本页面。</p>
        </div>
      </div>
    );
  }

  const isEmpty = !finalText && !interimText;

  return (
    <div className={styles.panel}>
      <div className={styles.scroll} ref={scrollRef}>
        {isEmpty ? (
          <p className={styles.placeholder}>
            {listening ? "正在听……开始说话吧" : "点击“开始”按钮，允许麦克风权限后开始"}
          </p>
        ) : (
          <p className={styles.text}>
            {finalText}
            {interimText && <span className={styles.interim}> {interimText}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
