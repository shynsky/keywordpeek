"use client";

import { Coins, AlertTriangle, Plus } from "lucide-react";
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
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium",
          isEmpty
            ? "bg-destructive/10 text-destructive"
            : isLow
              ? "bg-score-medium/10 text-score-medium"
              : "credit-badge border",
          className
        )}
        title={`${credits} credits remaining`}
      >
        <Coins className="h-3.5 w-3.5" />
        <span className="font-mono tabular-nums">{credits.toLocaleString()}</span>
      </div>
    );
  }

  if (variant === "large") {
    return (
      <div className={cn("text-center", className)}>
        <div
          className={cn(
            "inline-flex items-center gap-3 px-6 py-4 rounded-xl",
            isEmpty
              ? "bg-destructive/10"
              : isLow
                ? "bg-score-medium/10"
                : "bg-credit/10"
          )}
        >
          <Coins
            className={cn(
              "h-8 w-8",
              isEmpty
                ? "text-destructive"
                : isLow
                  ? "text-score-medium"
                  : "text-credit"
            )}
          />
          <div className="text-left">
            <p
              className={cn(
                "text-3xl font-bold font-mono tabular-nums",
                isEmpty
                  ? "text-destructive"
                  : isLow
                    ? "text-score-medium"
                    : "text-credit"
              )}
            >
              {credits.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">credits remaining</p>
          </div>
        </div>

        {showBuyButton && (
          <Button asChild className="mt-4">
            <Link href="/account">
              <Plus className="h-4 w-4 mr-2" />
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
          "flex items-center gap-2 px-3 py-2 rounded-lg border",
          isEmpty
            ? "bg-destructive/10 border-destructive/30"
            : isLow
              ? "bg-score-medium/10 border-score-medium/30"
              : "credit-badge"
        )}
      >
        {isLow && !isEmpty && (
          <AlertTriangle className="h-4 w-4 text-score-medium" />
        )}
        <Coins
          className={cn(
            "h-4 w-4",
            isEmpty
              ? "text-destructive"
              : isLow
                ? "text-score-medium"
                : "text-credit"
          )}
        />
        <span
          className={cn(
            "font-mono font-semibold tabular-nums",
            isEmpty
              ? "text-destructive"
              : isLow
                ? "text-score-medium"
                : "text-credit"
          )}
        >
          {credits.toLocaleString()}
        </span>
        <span className="text-sm text-muted-foreground">credits</span>
      </div>

      {showBuyButton && (
        <Button variant="outline" size="sm" asChild>
          <Link href="/account">
            <Plus className="h-4 w-4 mr-1" />
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
        "flex items-center justify-between gap-4 px-4 py-3 rounded-lg",
        isEmpty
          ? "bg-destructive/10 border border-destructive/30"
          : "bg-score-medium/10 border border-score-medium/30",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          className={cn(
            "h-5 w-5",
            isEmpty ? "text-destructive" : "text-score-medium"
          )}
        />
        <div>
          <p
            className={cn(
              "font-medium",
              isEmpty ? "text-destructive" : "text-score-medium"
            )}
          >
            {isEmpty ? "No credits remaining" : "Low credits"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isEmpty
              ? "Purchase credits to continue researching keywords"
              : `Only ${credits} credits left. Consider buying more.`}
          </p>
        </div>
      </div>
      <Button
        variant={isEmpty ? "default" : "outline"}
        size="sm"
        asChild
        className={isEmpty ? "" : "border-score-medium/50 text-score-medium hover:bg-score-medium/10"}
      >
        <Link href="/account">Buy Credits</Link>
      </Button>
    </div>
  );
}
