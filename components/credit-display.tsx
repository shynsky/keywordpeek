"use client";

import { Coins, AlertTriangle, Plus, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CreditDisplayProps {
  credits: number;
  showBuyButton?: boolean;
  variant?: "default" | "compact" | "large";
  className?: string;
}

const LOW_CREDIT_THRESHOLD = 10;

export function CreditDisplay({
  credits,
  showBuyButton = true,
  variant = "default",
  className,
}: CreditDisplayProps) {
  const isLow = credits <= LOW_CREDIT_THRESHOLD;
  const isEmpty = credits === 0;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 hover:scale-105",
          isEmpty
            ? "bg-destructive/15 text-destructive border-destructive/30"
            : isLow
              ? "bg-score-medium/15 text-score-medium border-score-medium/30"
              : "bg-primary/15 text-primary border-primary/30",
          className
        )}
        title={`${credits} credits remaining`}
      >
        <Coins className="h-4 w-4" />
        <span className="font-mono tabular-nums">{credits.toLocaleString()}</span>
      </div>
    );
  }

  if (variant === "large") {
    return (
      <div className={cn("text-center", className)}>
        <div
          className={cn(
            "inline-flex items-center gap-4 px-8 py-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-playful-lg",
            isEmpty
              ? "bg-destructive/10 border-destructive/30"
              : isLow
                ? "bg-score-medium/10 border-score-medium/30"
                : "bg-gradient-card border-primary/20"
          )}
        >
          <div
            className={cn(
              "p-3 rounded-xl",
              isEmpty
                ? "bg-destructive/20"
                : isLow
                  ? "bg-score-medium/20"
                  : "bg-primary/20"
            )}
          >
            <Coins
              className={cn(
                "h-10 w-10",
                isEmpty
                  ? "text-destructive"
                  : isLow
                    ? "text-score-medium"
                    : "text-primary"
              )}
            />
          </div>
          <div className="text-left">
            <p
              className={cn(
                "text-4xl font-bold font-mono tabular-nums",
                isEmpty
                  ? "text-destructive"
                  : isLow
                    ? "text-score-medium"
                    : "text-gradient"
              )}
            >
              {credits.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground font-medium">credits remaining</p>
          </div>
        </div>

        {showBuyButton && (
          <Button asChild variant="gradient" size="lg" className="mt-6 gap-2">
            <Link href="/account">
              <Sparkles className="h-5 w-5" />
              Buy More Credits
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
          isEmpty
            ? "bg-destructive/10 border-destructive/30"
            : isLow
              ? "bg-score-medium/10 border-score-medium/30"
              : "bg-primary/10 border-primary/30"
        )}
      >
        {isLow && !isEmpty && (
          <AlertTriangle className="h-4 w-4 text-score-medium animate-wiggle" />
        )}
        <Coins
          className={cn(
            "h-5 w-5",
            isEmpty
              ? "text-destructive"
              : isLow
                ? "text-score-medium"
                : "text-primary"
          )}
        />
        <span
          className={cn(
            "font-mono font-bold tabular-nums text-lg",
            isEmpty
              ? "text-destructive"
              : isLow
                ? "text-score-medium"
                : "text-primary"
          )}
        >
          {credits.toLocaleString()}
        </span>
        <span className="text-sm text-muted-foreground font-medium">credits</span>
      </div>

      {showBuyButton && (
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <Link href="/account">
            <Plus className="h-4 w-4" />
            Buy
          </Link>
        </Button>
      )}
    </div>
  );
}

/**
 * Low credit warning banner
 */
interface LowCreditWarningProps {
  credits: number;
  className?: string;
}

export function LowCreditWarning({ credits, className }: LowCreditWarningProps) {
  if (credits > LOW_CREDIT_THRESHOLD) return null;

  const isEmpty = credits === 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-300 animate-fade-in-up",
        isEmpty
          ? "bg-destructive/10 border-destructive/30"
          : "bg-score-medium/10 border-score-medium/30",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "p-2.5 rounded-xl",
            isEmpty ? "bg-destructive/20" : "bg-score-medium/20"
          )}
        >
          {isEmpty ? (
            <Zap className="h-6 w-6 text-destructive" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-score-medium animate-wiggle" />
          )}
        </div>
        <div>
          <p
            className={cn(
              "font-bold text-lg",
              isEmpty ? "text-destructive" : "text-score-medium"
            )}
          >
            {isEmpty ? "Out of credits!" : "Running low on credits"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isEmpty
              ? "Purchase credits to continue discovering keyword opportunities"
              : `Only ${credits} credits left. Stock up to keep researching!`}
          </p>
        </div>
      </div>
      <Button
        variant={isEmpty ? "gradient" : "outline"}
        size="lg"
        asChild
        className={cn(
          "gap-2",
          !isEmpty && "border-score-medium/50 text-score-medium hover:bg-score-medium/10"
        )}
      >
        <Link href="/account">
          <Sparkles className="h-4 w-4" />
          Buy Credits
        </Link>
      </Button>
    </div>
  );
}
