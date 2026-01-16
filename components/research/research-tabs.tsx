"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export type ResearchTab = "validation" | "competitors" | "content";

interface ResearchTabsProps {
  activeTab: ResearchTab;
  onTabChange: (tab: ResearchTab) => void;
  completedTabs: ResearchTab[];
  loadingTab?: ResearchTab | null;
  className?: string;
}

const TABS: Array<{
  id: ResearchTab;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: "validation",
    label: "Validation",
    shortLabel: "1. Validate",
    description: "Analyze demand & competition",
  },
  {
    id: "competitors",
    label: "Competitors",
    shortLabel: "2. Competitors",
    description: "Discover who's ranking",
  },
  {
    id: "content",
    label: "Content Plan",
    shortLabel: "3. Content",
    description: "Create your roadmap",
  },
];

export function ResearchTabs({
  activeTab,
  onTabChange,
  completedTabs,
  loadingTab,
  className,
}: ResearchTabsProps) {
  return (
    <div className={cn("flex rounded-xl bg-muted/50 p-1", className)}>
      {TABS.map((tab, index) => {
        const isActive = activeTab === tab.id;
        const isCompleted = completedTabs.includes(tab.id);
        const isLoading = loadingTab === tab.id;
        const isPreviousCompleted =
          index === 0 || completedTabs.includes(TABS[index - 1].id);
        const isClickable = isPreviousCompleted || isCompleted;

        return (
          <button
            key={tab.id}
            onClick={() => isClickable && onTabChange(tab.id)}
            disabled={!isClickable}
            className={cn(
              "flex-1 relative px-4 py-3 rounded-lg transition-all duration-200",
              "flex items-center justify-center gap-2",
              isActive
                ? "bg-card shadow-sm"
                : isClickable
                ? "hover:bg-card/50"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            {/* Status indicator */}
            <span className="flex-shrink-0">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-score-easy" />
              ) : (
                <Circle
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              )}
            </span>

            {/* Label */}
            <span
              className={cn(
                "font-medium text-sm",
                isActive
                  ? "text-foreground"
                  : isCompleted
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface TabContentProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

export function TabContent({ children, isActive, className }: TabContentProps) {
  if (!isActive) return null;

  return (
    <div
      className={cn(
        "animate-fade-in-up",
        className
      )}
    >
      {children}
    </div>
  );
}
