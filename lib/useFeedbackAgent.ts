"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeTranscript, OpenRouterError } from "./openrouter";
import { resultToSuggestions, type Suggestion } from "./feedback";

const SILENCE_MS = 1500;
const MIN_NEW_CHARS = 12;
const ANALYSIS_WINDOW_CHARS = 800;
const MAX_SUGGESTIONS = 20;

interface UseFeedbackAgentOptions {
  enabled: boolean;
  apiKey: string;
  model: string;
  transcript: string;
}

interface UseFeedbackAgentResult {
  suggestions: Suggestion[];
  analyzing: boolean;
  error: string | null;
  clear: () => void;
}

export function useFeedbackAgent({
  enabled,
  apiKey,
  model,
  transcript,
}: UseFeedbackAgentOptions): UseFeedbackAgentResult {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastAnalyzedLengthRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  const runAnalysis = useCallback(async () => {
    if (inFlightRef.current) return;
    const newLength = transcript.length;
    const delta = newLength - lastAnalyzedLengthRef.current;
    if (delta < MIN_NEW_CHARS) return;

    const chunk = transcript.slice(-ANALYSIS_WINDOW_CHARS);
    inFlightRef.current = true;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeTranscript(apiKey, model, chunk);
      lastAnalyzedLengthRef.current = newLength;
      const fresh = resultToSuggestions(result);
      if (fresh.length > 0) {
        setSuggestions((prev) => [...fresh, ...prev].slice(0, MAX_SUGGESTIONS));
      }
    } catch (err) {
      lastAnalyzedLengthRef.current = newLength;
      setError(err instanceof OpenRouterError ? err.message : "分析请求失败，请检查网络或 API Key");
    } finally {
      inFlightRef.current = false;
      setAnalyzing(false);
    }
  }, [apiKey, model, transcript]);

  useEffect(() => {
    if (!enabled || !apiKey || !model || transcript.length === 0) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runAnalysis();
    }, SILENCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [transcript, enabled, apiKey, model, runAnalysis]);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
    lastAnalyzedLengthRef.current = 0;
  }, []);

  return { suggestions, analyzing, error, clear };
}
