"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  type OnboardingState,
  type OnboardingIntent,
  getOnboardingState,
  saveOnboardingState,
  isOnboardingActive,
} from "@/lib/onboarding";

interface OnboardingContextValue {
  state: OnboardingState;
  isActive: boolean;
  setIntent: (intent: OnboardingIntent) => void;
  markStepComplete: (step: keyof OnboardingState["completedSteps"]) => void;
  skipOnboarding: () => void;
  incrementSearchCount: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// Default state for SSR
const DEFAULT_STATE: OnboardingState = {
  version: 1,
  intent: null,
  completedSteps: {
    welcomeModal: false,
    firstSearch: false,
    viewedResultsEducation: false,
    triedRelatedKeywords: false,
    triedPAAQuestions: false,
    seenProjectPrompt: false,
  },
  dismissedAt: null,
  startedAt: new Date().toISOString(),
  searchCount: 0,
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // Use a ref-like pattern to track hydration without triggering re-render loops
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [state, setState] = useState<OnboardingState>(() => {
    // Only read from localStorage on client
    if (typeof window !== "undefined") {
      return getOnboardingState();
    }
    return DEFAULT_STATE;
  });

  // Persist changes to localStorage
  useEffect(() => {
    if (isClient) {
      saveOnboardingState(state);
    }
  }, [state, isClient]);

  const setIntent = useCallback((intent: OnboardingIntent) => {
    setState((prev) => ({
      ...prev,
      intent,
      completedSteps: {
        ...prev.completedSteps,
        welcomeModal: true,
      },
    }));
  }, []);

  const markStepComplete = useCallback(
    (step: keyof OnboardingState["completedSteps"]) => {
      setState((prev) => ({
        ...prev,
        completedSteps: {
          ...prev.completedSteps,
          [step]: true,
        },
      }));
    },
    []
  );

  const skipOnboarding = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dismissedAt: new Date().toISOString(),
      completedSteps: {
        ...prev.completedSteps,
        welcomeModal: true,
      },
    }));
  }, []);

  const incrementSearchCount = useCallback(() => {
    setState((prev) => ({
      ...prev,
      searchCount: prev.searchCount + 1,
      completedSteps: {
        ...prev.completedSteps,
        firstSearch: true,
      },
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    const newState: OnboardingState = {
      version: 1,
      intent: null,
      completedSteps: {
        welcomeModal: false,
        firstSearch: false,
        viewedResultsEducation: false,
        triedRelatedKeywords: false,
        triedPAAQuestions: false,
        seenProjectPrompt: false,
      },
      dismissedAt: null,
      startedAt: new Date().toISOString(),
      searchCount: 0,
    };
    setState(newState);
  }, []);

  const isActive = isOnboardingActive(state);

  // Don't render children until client-side to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <OnboardingContext.Provider
      value={{
        state,
        isActive,
        setIntent,
        markStepComplete,
        skipOnboarding,
        incrementSearchCount,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
