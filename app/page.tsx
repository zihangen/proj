"use client";

import { useState } from "react";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { useFeedbackAgent } from "@/lib/useFeedbackAgent";
import { useSettings } from "@/lib/useSettings";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import styles from "./page.module.css";

export default function Home() {
  const { settings, setSettings, loaded } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const speech = useSpeechRecognition({ lang: settings.lang });

  const feedback = useFeedbackAgent({
    enabled: settings.agentEnabled,
    apiKey: settings.apiKey,
    model: settings.model,
    transcript: speech.finalText,
  });

  if (!loaded) return null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.title}>语音教练</span>
        <div className={styles.controls}>
          <select
            className={styles.langSelect}
            value={settings.lang}
            onChange={(e) =>
              setSettings({ ...settings, lang: e.target.value as typeof settings.lang })
            }
          >
            <option value="zh-CN">中文</option>
            <option value="en-US">English (US)</option>
          </select>
          <button
            className={`${styles.micButton} ${speech.listening ? styles.listening : ""}`}
            onClick={() => (speech.listening ? speech.stop() : speech.start())}
            disabled={!speech.supported}
          >
            {speech.listening ? "● 停止" : "○ 开始"}
          </button>
          <button
            className={styles.iconButton}
            onClick={() => {
              speech.clear();
              feedback.clear();
            }}
          >
            清空
          </button>
          <button className={styles.iconButton} onClick={() => setSettingsOpen(true)}>
            设置
          </button>
        </div>
      </header>

      {speech.error && speech.error !== "unsupported" && (
        <p className={styles.errorBar}>麦克风识别出错：{speech.error}</p>
      )}

      <div className={styles.body}>
        <TranscriptPanel
          finalText={speech.finalText}
          interimText={speech.interimText}
          listening={speech.listening}
          supported={speech.supported}
        />
        <FeedbackPanel
          enabled={settings.agentEnabled}
          hasApiKey={settings.apiKey.length > 0}
          suggestions={feedback.suggestions}
          analyzing={feedback.analyzing}
          error={feedback.error}
        />
      </div>

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
