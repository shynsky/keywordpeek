"use client";

import { getSuggestionsForIntent, type SuggestionCard } from "@/lib/onboarding";
import { useOnboarding } from "./onboarding-context";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionCardsProps {
  onSearch: (keywords: string[]) => void;
  isLoading?: boolean;
}

export function SuggestionCards({ onSearch, isLoading }: SuggestionCardsProps) {
  const { state } = useOnboarding();

  // Only show if user has selected intent but hasn't done first search
  if (!state.intent || state.completedSteps.firstSearch) {
    return null;
  }

  const suggestions = getSuggestionsForIntent(state.intent);

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    if (!isLoading) {
      onSearch(suggestion.keywords);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/15 border-2 border-primary/30">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Try one of these searches</h2>
          <p className="text-sm text-muted-foreground">
            Click a card to instantly run a sample search
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <SuggestionCardItem
            key={suggestion.id}
            suggestion={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            isLoading={isLoading}
            delay={index * 0.1}
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Or enter your own keywords in the search bar above
      </p>
    </div>
  );
}

interface SuggestionCardItemProps {
  suggestion: SuggestionCard;
  onClick: () => void;
  isLoading?: boolean;
  delay?: number;
}

function SuggestionCardItem({
  suggestion,
  onClick,
  isLoading,
  delay = 0,
}: SuggestionCardItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "w-full text-left p-5 border-2 border-border bg-card",
        "transition-all duration-150 group",
        "hover:border-primary hover:shadow-playful-lg hover:-translate-y-1",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        "animate-bounce-in"
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{suggestion.emoji}</span>
        <h3 className="font-bold text-base group-hover:text-primary transition-colors">
          {suggestion.title}
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {suggestion.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {suggestion.keywords.map((keyword, idx) => (
          <span
            key={idx}
            className="px-2 py-1 text-xs font-medium bg-muted border border-border truncate max-w-full"
          >
            {keyword}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">1 credit</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wide group-hover:translate-x-1 transition-transform">
          <Search className="h-3.5 w-3.5" />
          Search
        </span>
      </div>
    </button>
  );
}
