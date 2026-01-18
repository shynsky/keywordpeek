"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { INTENT_OPTIONS, type OnboardingIntent } from "@/lib/onboarding";
import { useOnboarding } from "./onboarding-context";
import { cn } from "@/lib/utils";

export function WelcomeModal() {
  const { state, setIntent, skipOnboarding } = useOnboarding();
  const [selectedIntent, setSelectedIntent] = useState<OnboardingIntent | null>(null);

  // Show modal only if welcome hasn't been completed and not dismissed
  const isOpen = !state.completedSteps.welcomeModal && !state.dismissedAt;

  const handleContinue = () => {
    if (selectedIntent) {
      setIntent(selectedIntent);
    }
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[540px] p-0 gap-0 border-2 border-foreground"
      >
        <DialogHeader className="p-6 pb-4 border-b-2 border-border">
          <div className="flex items-center gap-3 mb-1">
            <Image src="/K-big.png" alt="KeywordPeek" width={36} height={36} className="w-9 h-9" />
            <DialogTitle className="font-mono font-bold text-lg uppercase tracking-widest">
              Welcome to [KEYWORDPEEK]
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-muted-foreground">
            Tell us what brings you here so we can help you get started
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-3">
          {INTENT_OPTIONS.map((option, index) => (
            <button
              key={option.id}
              onClick={() => setSelectedIntent(option.id)}
              className={cn(
                "w-full p-4 text-left border-2 transition-all duration-150",
                "animate-fade-in-up",
                selectedIntent === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/50 bg-card"
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-0.5">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    selectedIntent === option.id
                      ? "border-primary bg-primary"
                      : "border-border"
                  )}
                >
                  {selectedIntent === option.id && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 pt-4 border-t-2 border-border flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip intro
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedIntent}
            className="sm:min-w-[140px]"
          >
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
