"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditDisplay } from "@/components/credit-display";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 1000,
    price: "$9",
    perKeyword: "$0.009",
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    credits: 3000,
    price: "$19",
    perKeyword: "$0.006",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 10000,
    price: "$49",
    perKeyword: "$0.005",
    popular: false,
  },
];

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

interface UsageStats {
  totalSearches: number;
  creditsUsed: number;
  keywordsResearched: number;
}

export default function AccountPage() {
  const searchParams = useSearchParams();
  const [credits, setCredits] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for success/cancel params
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccessMessage(true);
      // Clear the URL params
      window.history.replaceState({}, "", "/account");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    // Fetch profile (credits)
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profile) {
      setCredits(profile.credits);
    }

    // Fetch transactions
    const { data: txns } = await supabase
      .from("transactions")
      .select("id, amount, type, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (txns) {
      setTransactions(txns);
    }

    // Fetch usage stats
    const { data: usage } = await supabase
      .from("api_usage")
      .select("credits_used, keywords_count")
      .eq("user_id", user.id);

    if (usage) {
      setUsageStats({
        totalSearches: usage.length,
        creditsUsed: usage.reduce((sum, u) => sum + u.credits_used, 0),
        keywordsResearched: usage.reduce((sum, u) => sum + (u.keywords_count || 0), 0),
      });
    }

    setIsLoading(false);
  };

  const handlePurchase = async (packageId: string) => {
    setPurchasingPackage(packageId);

    try {
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        setPurchasingPackage(null);
      }
    } catch (error) {
      console.error("Error initiating purchase:", error);
      setPurchasingPackage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success message */}
      {showSuccessMessage && (
        <div className="p-4 rounded-lg bg-score-easy/10 border border-score-easy/30 text-score-easy flex items-center gap-3">
          <Check className="h-5 w-5" />
          <div>
            <p className="font-medium">Payment successful!</p>
            <p className="text-sm opacity-80">
              Your credits have been added to your account.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setShowSuccessMessage(false)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold">Account</h1>
        <p className="text-muted-foreground mt-1">
          Manage your credits and view usage history.
        </p>
      </div>

      {/* Credits display */}
      {credits !== null && (
        <CreditDisplay credits={credits} variant="large" showBuyButton={false} />
      )}

      {/* Usage stats */}
      {usageStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Total Searches</span>
            </div>
            <p className="text-2xl font-display font-semibold">
              {usageStats.totalSearches}
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Keywords Researched</span>
            </div>
            <p className="text-2xl font-display font-semibold">
              {usageStats.keywordsResearched.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">Credits Used</span>
            </div>
            <p className="text-2xl font-display font-semibold">
              {usageStats.creditsUsed.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Pricing section */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-semibold">Buy Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "relative p-6 rounded-xl border bg-card",
                pkg.popular && "border-accent ring-2 ring-accent/20"
              )}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-display font-semibold text-lg">{pkg.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-display font-bold">{pkg.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {pkg.perKeyword} per keyword
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-score-easy" />
                  <span>{pkg.credits.toLocaleString()} credits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-score-easy" />
                  <span>Never expires</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-score-easy" />
                  <span>Full keyword data</span>
                </div>
              </div>

              <Button
                className="w-full"
                variant={pkg.popular ? "default" : "outline"}
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchasingPackage !== null}
              >
                {purchasingPackage === pkg.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  `Buy ${pkg.name}`
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-display font-semibold">Recent Transactions</h2>
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                    Date
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                    Description
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                    Type
                  </th>
                  <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">
                    Credits
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {tx.description || tx.type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          tx.type === "purchase" && "bg-score-easy/10 text-score-easy",
                          tx.type === "bonus" && "bg-accent/10 text-accent",
                          tx.type === "usage" && "bg-muted text-muted-foreground"
                        )}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-sm font-mono tabular-nums text-right",
                        tx.amount > 0 ? "text-score-easy" : "text-muted-foreground"
                      )}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
