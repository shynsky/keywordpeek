"use client";

import { TrendingUp, Link2, MapPin, Users, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContextualSuggestion } from "@/lib/openai/keywords";

const SUGGESTION_ICONS = {
  trends: TrendingUp,
  backlinks: Link2,
  local: MapPin,
  competitor: Users,
} as const;

interface SmartSuggestionsProps {
  suggestions: ContextualSuggestion[];
  className?: string;
}

export function SmartSuggestions({
  suggestions,
  className,
}: SmartSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>Smart Suggestions</span>
      </div>

      <div className="grid gap-2">
        {suggestions.map((suggestion) => {
          const Icon = SUGGESTION_ICONS[suggestion.type];

          return (
            <div
              key={suggestion.type}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border-2 transition-colors",
                suggestion.available
                  ? "border-border bg-card hover:border-primary/50"
                  : "border-border/50 bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg shrink-0",
                  suggestion.available
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "font-medium text-sm",
                      !suggestion.available && "text-muted-foreground"
                    )}
                  >
                    {suggestion.label}
                  </span>
                  {!suggestion.available && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {suggestion.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 italic">
                  {suggestion.reason}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
