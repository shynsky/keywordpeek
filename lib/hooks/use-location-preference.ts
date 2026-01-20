"use client";

import { useState, useCallback } from "react";
import {
  DEFAULT_LOCATION_CODE,
  DEFAULT_LANGUAGE_CODE,
} from "@/lib/constants/locations";

const STORAGE_KEY = "keywordpeek:location";

interface StoredLocation {
  code: number;
  lang: string;
}

function getInitialLocation(): StoredLocation {
  if (typeof window === "undefined") {
    return { code: DEFAULT_LOCATION_CODE, lang: DEFAULT_LANGUAGE_CODE };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: StoredLocation = JSON.parse(stored);
      if (typeof parsed.code === "number" && typeof parsed.lang === "string") {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors, use defaults
  }
  return { code: DEFAULT_LOCATION_CODE, lang: DEFAULT_LANGUAGE_CODE };
}

/**
 * Custom hook that persists user's location preference to localStorage.
 * Returns [locationCode, languageCode, setLocation] tuple.
 */
export function useLocationPreference(): [
  number,
  string,
  (code: number, lang: string) => void
] {
  const [location, setLocationState] = useState<StoredLocation>(getInitialLocation);

  const setLocation = useCallback((code: number, lang: string) => {
    setLocationState({ code, lang });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, lang }));
    } catch {
      // Ignore storage errors (e.g., private browsing mode)
    }
  }, []);

  return [location.code, location.lang, setLocation];
}
