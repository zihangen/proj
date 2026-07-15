"use client";

import { useEffect, useState } from "react";
import { fetchOpenRouterModels, FALLBACK_FREE_MODELS, type OpenRouterModel } from "./openrouter";

interface UseModelCatalogResult {
  models: OpenRouterModel[];
  loading: boolean;
}

export function useModelCatalog(): UseModelCatalogResult {
  const [models, setModels] = useState<OpenRouterModel[]>(FALLBACK_FREE_MODELS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchOpenRouterModels().then((list) => {
      if (cancelled) return;
      if (list.length > 0) setModels(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { models, loading };
}
