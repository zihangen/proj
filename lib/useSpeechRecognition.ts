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

  const pendingLangRestartRef = useRef(false);
  const startRef = useRef<() => void>(() => {});

  useEffect(() => {
    const prevLang = langRef.current;
    langRef.current = lang;
    if (prevLang === lang) return;
    if (shouldListenRef.current && recognitionRef.current) {
      pendingLangRestartRef.current = true;
      recognitionRef.current.abort();
    }
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
      if (pendingLangRestartRef.current) {
        pendingLangRestartRef.current = false;
        recognitionRef.current = null;
        if (shouldListenRef.current) startRef.current();
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
    recognitionRef.current?.stop();
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
