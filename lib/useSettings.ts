"use client";

import { useEffect, useState } from "react";
import type { SpeechLang } from "./useSpeechRecognition";

const STORAGE_KEY = "speech-coach-settings-v1";

export interface Settings {
  lang: SpeechLang;
  agentEnabled: boolean;
  apiKey: string;
  model: string;
}

const DEFAULT_SETTINGS: Settings = {
  lang: "zh-CN",
  agentEnabled: false,
  apiKey: "",
  // Left blank on purpose: OpenRouter's free-model lineup changes over time,
  // so a hardcoded slug goes stale. useModelCatalog fills this in once the
  // live model list has loaded.
  model: "",
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable post-mount
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      // ignore malformed storage
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, loaded]);

  return { settings, setSettings, loaded };
}
