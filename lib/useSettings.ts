"use client";

import { useEffect, useState } from "react";
import type { SpeechLang } from "./useSpeechRecognition";
import { DEFAULT_MODEL_ID } from "./models";

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
  model: DEFAULT_MODEL_ID,
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
