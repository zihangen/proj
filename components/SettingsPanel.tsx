"use client";

import type { Settings } from "@/lib/useSettings";
import { CURATED_MODELS, getModel } from "@/lib/models";
import styles from "./SettingsPanel.module.css";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  const selectedModel = getModel(settings.model);

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

        <label className={styles.field}>
          <span className={styles.fieldLabel}>模型</span>
          <select
            className={styles.select}
            value={settings.model}
            onChange={(e) => onChange({ ...settings, model: e.target.value })}
          >
            {CURATED_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.free ? "🆓 " : "💳 "}
                {m.label}
              </option>
            ))}
          </select>
        </label>

        {selectedModel?.requiresKey && (
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
              获取你自己的 Key（这个模型是付费的，费用记在你自己的账户上）。
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
