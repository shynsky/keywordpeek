"use client";

import { useOnboarding } from "./onboarding-context";
import { Button } from "@/components/ui/button";
import { X, Target, TrendingUp, DollarSign, Gauge, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResultsEducationCard() {
  const { state, markStepComplete } = useOnboarding();

  // Only show after first search and if not already dismissed
  if (!state.completedSteps.firstSearch || state.completedSteps.viewedResultsEducation) {
    return null;
  }

  // Don't show if onboarding was skipped
  if (state.dismissedAt) {
    return null;
  }

  const handleDismiss = () => {
    markStepComplete("viewedResultsEducation");
  };

  return (
    <div className="border-2 border-primary/30 bg-primary/5 p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/15 border-2 border-primary/30">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base uppercase tracking-wide">
              Understanding Your Results
            </h3>
            <p className="text-sm text-muted-foreground">
              Here&apos;s what each metric means
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricExplanation
          icon={Target}
          title="Keyword Score"
          description="0-100 opportunity rating. Higher = easier to rank with good volume."
          color="text-primary"
        />
        <MetricExplanation
          icon={TrendingUp}
          title="Search Volume"
          description="Monthly searches. Shows how many people look for this keyword."
          color="text-score-easy"
        />
        <MetricExplanation
          icon={Gauge}
          title="Difficulty"
          description="How hard to rank. Lower is easier. Under 30 = good opportunity."
          color="text-score-medium"
        />
        <MetricExplanation
          icon={DollarSign}
          title="CPC"
          description="Cost per click. Higher CPC = more valuable commercial intent."
          color="text-accent-foreground"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-primary/20 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Pro tip:</span> Sort by Keyword Score to find the best opportunities
        </p>
        <Button variant="outline" size="sm" onClick={handleDismiss}>
          Got it
        </Button>
      </div>
    </div>
  );
}

interface MetricExplanationProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

function MetricExplanation({
  icon: Icon,
  title,
  description,
  color,
}: MetricExplanationProps) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn("p-1.5 bg-muted border border-border", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-sm mb-0.5">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
