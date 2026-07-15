"use client";

import type { Settings } from "@/lib/useSettings";
import type { OpenRouterModel } from "@/lib/openrouter";
import styles from "./SettingsPanel.module.css";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
  models: OpenRouterModel[];
  modelsLoading: boolean;
}

export function SettingsPanel({
  settings,
  onChange,
  onClose,
  models,
  modelsLoading,
}: SettingsPanelProps) {
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
            {models.length === 0 && <option value="">加载中…</option>}
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.free ? "🆓 " : "💳 "}
                {m.name}
              </option>
            ))}
          </select>
          <span className={styles.hint}>免费模型的名单会不定期变动，这里始终显示 OpenRouter 当前实际可用的模型。</span>
        </label>
      </div>
    </div>
  );
}
