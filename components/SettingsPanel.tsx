"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/lib/useSettings";
import { fetchOpenRouterModels, FALLBACK_FREE_MODELS, type OpenRouterModel } from "@/lib/openrouter";
import styles from "./SettingsPanel.module.css";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const [models, setModels] = useState<OpenRouterModel[]>(FALLBACK_FREE_MODELS);
  const [modelsLoading, setModelsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchOpenRouterModels().then((list) => {
      if (!cancelled && list.length > 0) setModels(list);
      if (!cancelled) setModelsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>设置</span>
          <button className={styles.close} onClick={onClose} aria-label="关闭设置">
            ×
          </button>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>识别语言</span>
          <select
            className={styles.select}
            value={settings.lang}
            onChange={(e) => onChange({ ...settings, lang: e.target.value as Settings["lang"] })}
          >
            <option value="zh-CN">中文（普通话）</option>
            <option value="en-US">English (US)</option>
          </select>
        </label>

        <label className={styles.toggleField}>
          <input
            type="checkbox"
            checked={settings.agentEnabled}
            onChange={(e) => onChange({ ...settings, agentEnabled: e.target.checked })}
          />
          <span>开启表达反馈</span>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>OpenRouter API Key</span>
          <input
            className={styles.input}
            type="password"
            placeholder="sk-or-v1-..."
            value={settings.apiKey}
            onChange={(e) => onChange({ ...settings, apiKey: e.target.value })}
            autoComplete="off"
          />
          <span className={styles.hint}>
            只保存在你的浏览器本地。前往{" "}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
              openrouter.ai/keys
            </a>{" "}
            免费注册获取（可用免费模型，也可绑定自己的付费额度）。
          </span>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>模型{modelsLoading && "（加载中…）"}</span>
          <select
            className={styles.select}
            value={settings.model}
            onChange={(e) => onChange({ ...settings, model: e.target.value })}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.free ? "🆓 " : "💳 "}
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
