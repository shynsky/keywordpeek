"use client";

import { useOnboarding } from "./onboarding-context";
import { Button } from "@/components/ui/button";
import { X, Sparkles, FolderPlus, MessageCircleQuestion, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoverMorePromptProps {
  onExploreRelated?: () => void;
  onExplorePAA?: () => void;
}

export function DiscoverMorePrompt({
  onExploreRelated,
  onExplorePAA,
}: DiscoverMorePromptProps) {
  const { state, markStepComplete } = useOnboarding();

  // Show after first search, but only if user hasn't explored these features
  const showRelated = state.completedSteps.firstSearch && !state.completedSteps.triedRelatedKeywords;
  const showPAA = state.completedSteps.firstSearch && !state.completedSteps.triedPAAQuestions;

  // Don't show if skipped or both already explored
  if (state.dismissedAt || (!showRelated && !showPAA)) {
    return null;
  }

  // Don't show until education card is dismissed
  if (!state.completedSteps.viewedResultsEducation) {
    return null;
  }

  const handleRelatedClick = () => {
    markStepComplete("triedRelatedKeywords");
    onExploreRelated?.();
  };

  const handlePAAClick = () => {
    markStepComplete("triedPAAQuestions");
    onExplorePAA?.();
  };

  const handleDismiss = () => {
    markStepComplete("triedRelatedKeywords");
    markStepComplete("triedPAAQuestions");
  };

  return (
    <div className="border-2 border-border bg-card p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/20 border-2 border-accent/40">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-base uppercase tracking-wide">
              Discover More Ideas
            </h3>
            <p className="text-sm text-muted-foreground">
              Expand your research with these features
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {showRelated && (
          <FeatureCard
            icon={Link2}
            title="Related Keywords"
            description="Find similar keywords you might have missed"
            credits="1 credit"
            onClick={handleRelatedClick}
          />
        )}
        {showPAA && (
          <FeatureCard
            icon={MessageCircleQuestion}
            title="People Also Ask"
            description="See what questions users ask about this topic"
            credits="1 credit"
            onClick={handlePAAClick}
          />
        )}
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  credits: string;
  onClick?: () => void;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  credits,
  onClick,
}: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 border-2 border-border bg-muted/50",
        "transition-all duration-150 group",
        "hover:border-primary hover:bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-background border border-border group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm mb-0.5 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
          <span className="text-xs text-muted-foreground">{credits}</span>
        </div>
      </div>
    </button>
  );
}

interface ProjectPromptProps {
  onCreateProject?: () => void;
}

export function ProjectPrompt({ onCreateProject }: ProjectPromptProps) {
  const { state, markStepComplete } = useOnboarding();

  // Show after 3+ searches and if project prompt not seen
  const shouldShow =
    state.searchCount >= 3 &&
    !state.completedSteps.seenProjectPrompt &&
    !state.dismissedAt;

  if (!shouldShow) {
    return null;
  }

  const handleDismiss = () => {
    markStepComplete("seenProjectPrompt");
  };

  const handleCreate = () => {
    markStepComplete("seenProjectPrompt");
    onCreateProject?.();
  };

  return (
    <div className="border-2 border-border bg-muted/30 p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-score-easy/15 border-2 border-score-easy/30">
            <FolderPlus className="h-5 w-5 text-score-easy" />
          </div>
          <div>
            <h3 className="font-bold text-base mb-1">
              Save your research to a project
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Projects help you organize keywords for different websites or campaigns.
              You can save keywords, track changes, and export your research.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="primary" size="sm" onClick={handleCreate}>
                <FolderPlus className="h-4 w-4" />
                Create Project
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Maybe later
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground flex-shrink-0 hidden sm:flex"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
