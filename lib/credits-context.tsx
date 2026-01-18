"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface CreditsContextValue {
  credits: number | null;
  isLoading: boolean;
  refreshCredits: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchCredits = useCallback(async () => {
    const supabase = createClient();

    // Dev mode: use mock user ID
    const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;
    if (devUserId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", devUserId)
        .single();

      if (profile) {
        setCredits(profile.credits);
      }
      setIsLoading(false);
      return;
    }

    // Production: use real auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (profile) {
        setCredits(profile.credits);
      }
    }
    setIsLoading(false);
  }, []);

  const refreshCredits = useCallback(async () => {
    setIsLoading(true);
    await fetchCredits();
  }, [fetchCredits]);

  useEffect(() => {
    // Only fetch once on mount to avoid cascading renders
    if (!hasFetched.current) {
      hasFetched.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching on mount is a standard pattern
      fetchCredits();
    }
  }, [fetchCredits]);

  const value = useMemo(
    () => ({ credits, isLoading, refreshCredits }),
    [credits, isLoading, refreshCredits]
  );

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used within CreditsProvider");
  }
  return context;
}
