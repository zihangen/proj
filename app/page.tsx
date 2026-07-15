"use client";

import { useEffect, useState } from "react";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { useFeedbackAgent } from "@/lib/useFeedbackAgent";
import { useSettings } from "@/lib/useSettings";
import { getModel, DEFAULT_MODEL_ID } from "@/lib/models";
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

  // A previously saved model id can go missing from the curated list (e.g.
  // after an app update). Fall back to the default instead of breaking.
  useEffect(() => {
    if (!loaded || getModel(settings.model)) return;
    setSettings((prev) => (prev.model === DEFAULT_MODEL_ID ? prev : { ...prev, model: DEFAULT_MODEL_ID }));
  }, [loaded, settings.model, setSettings]);

  if (!loaded) return null;

  const selectedModel = getModel(settings.model);
  const keyMissing = Boolean(selectedModel?.requiresKey) && settings.apiKey.length === 0;

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
          <label className={styles.agentToggle}>
            <input
              type="checkbox"
              checked={settings.agentEnabled}
              onChange={(e) => setSettings({ ...settings, agentEnabled: e.target.checked })}
            />
            <span>表达反馈</span>
          </label>
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
          keyMissing={keyMissing}
          suggestions={feedback.suggestions}
          analyzing={feedback.analyzing}
          error={feedback.error}
        />
      </div>

      {settingsOpen && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
