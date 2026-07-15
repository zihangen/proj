"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechLang = "zh-CN" | "en-US";

interface UseSpeechRecognitionOptions {
  lang: SpeechLang;
  onFinalChunk?: (text: string) => void;
}

interface UseSpeechRecognitionResult {
  supported: boolean;
  listening: boolean;
  finalText: string;
  interimText: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  clear: () => void;
}

const LANG_RESTART_FALLBACK_MS = 400;

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition({
  lang,
  onFinalChunk,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldListenRef = useRef(false);
  const langRef = useRef(lang);
  const onFinalChunkRef = useRef(onFinalChunk);

  // Restarting recognition after a language change is racy: Chrome doesn't
  // always fire `onend` promptly (or at all) right after `abort()`. A
  // generation counter lets us tell a stale restart apart from the latest
  // one, and a fallback timer forces the restart through even if `onend`
  // never shows up.
  const langGenerationRef = useRef(0);
  const pendingLangRestartGenRef = useRef<number | null>(null);
  const restartOnEndRef = useRef<() => void>(() => {});
  const startRef = useRef<() => void>(() => {});

  useEffect(() => {
    const prevLang = langRef.current;
    langRef.current = lang;
    if (prevLang === lang) return;
    if (!shouldListenRef.current || !recognitionRef.current) return;

    const gen = ++langGenerationRef.current;
    pendingLangRestartGenRef.current = gen;

    const restart = () => {
      if (pendingLangRestartGenRef.current !== gen) return;
      pendingLangRestartGenRef.current = null;
      recognitionRef.current = null;
      if (shouldListenRef.current) startRef.current();
    };

    recognitionRef.current.abort();
    const fallback = setTimeout(restart, LANG_RESTART_FALLBACK_MS);
    // Stash so the `onend` handler (bound to the aborted instance) can
    // trigger the same restart immediately instead of waiting for the timer.
    restartOnEndRef.current = restart;

    return () => clearTimeout(fallback);
  }, [lang]);

  useEffect(() => {
    onFinalChunkRef.current = onFinalChunk;
  }, [onFinalChunk]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser feature detection is only known post-mount
    setSupported(getRecognitionCtor() !== null);
  }, []);

  const createRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return null;

    const recognition = new Ctor();
    recognition.lang = langRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          setFinalText((prev) => {
            const next = prev ? `${prev} ${transcript.trim()}` : transcript.trim();
            return next;
          });
          onFinalChunkRef.current?.(transcript.trim());
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      setError(event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldListenRef.current = false;
        setListening(false);
      }
    };

    recognition.onend = () => {
      if (pendingLangRestartGenRef.current !== null) {
        restartOnEndRef.current();
        return;
      }
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch {
          // recognition may already be starting; ignore
        }
      } else {
        setListening(false);
      }
    };

    return recognition;
  }, []);

  const start = useCallback(() => {
    setError(null);
    const recognition = recognitionRef.current ?? createRecognition();
    if (!recognition) {
      setError("unsupported");
      return;
    }
    recognitionRef.current = recognition;
    shouldListenRef.current = true;
    try {
      recognition.start();
      setListening(true);
    } catch {
      // already started
    }
  }, [createRecognition]);

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    pendingLangRestartGenRef.current = null;
    // stop() (not abort()) lets the recognizer flush whatever audio it has
    // already buffered as a final result instead of discarding it — abort()
    // here was silently dropping the last thing the user said before they
    // clicked stop.
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
    setInterimText("");
  }, []);

  const clear = useCallback(() => {
    setFinalText("");
    setInterimText("");
  }, []);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return { supported, listening, finalText, interimText, error, start, stop, clear };
}
