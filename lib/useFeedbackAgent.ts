"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeTranscript, AnalyzeError } from "./openrouter";
import { resultToSuggestions, type Suggestion } from "./feedback";
import { getModel } from "./models";

// Short enough to fire once per natural sentence-ending pause, without
// misfiring on the small pauses that happen mid-sentence.
const SILENCE_MS = 600;
const MIN_NEW_CHARS = 6;
const ANALYSIS_WINDOW_CHARS = 600;
const MAX_SUGGESTIONS = 30;

interface UseFeedbackAgentOptions {
  enabled: boolean;
  apiKey: string;
  model: string;
  transcript: string;
  context: string;
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
  context,
}: UseFeedbackAgentOptions): UseFeedbackAgentResult {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastAnalyzedLengthRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const contextRef = useRef(context);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

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
      const result = await analyzeTranscript(model, apiKey, chunk, contextRef.current);
      lastAnalyzedLengthRef.current = newLength;
      const fresh = resultToSuggestions(result);
      if (fresh.length > 0) {
        setSuggestions((prev) => [...fresh, ...prev].slice(0, MAX_SUGGESTIONS));
      }
    } catch (err) {
      lastAnalyzedLengthRef.current = newLength;
      setError(err instanceof AnalyzeError ? err.message : "分析请求失败，请检查网络");
    } finally {
      inFlightRef.current = false;
      setAnalyzing(false);
    }
  }, [apiKey, model, transcript]);

  useEffect(() => {
    if (!enabled || !model || transcript.length === 0) return;
    if (getModel(model)?.requiresKey && !apiKey) return;

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
