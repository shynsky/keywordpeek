"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  FolderOpen,
  History,
  Coins,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditDisplay } from "@/components/credit-display";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { CreditsProvider, useCredits } from "@/lib/credits-context";
import { OnboardingProvider, WelcomeModal } from "@/components/onboarding";
import { QuarterCircle, Circle } from "@/components/decorations/geometric-shapes";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  emoji: string;
}

const navItems: NavItem[] = [
  { label: "Research", href: "/dashboard", icon: Search, emoji: "🔍" },
  { label: "Projects", href: "/dashboard/projects", icon: FolderOpen, emoji: "📁" },
  { label: "History", href: "/dashboard/history", icon: History, emoji: "📋" },
];

const bottomNavItems: NavItem[] = [
  { label: "Buy Credits", href: "/account", icon: Coins, emoji: "💰" },
  { label: "Settings", href: "/account/settings", icon: Settings, emoji: "⚙️" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreditsProvider>
      <OnboardingProvider>
        <AppLayoutInner>{children}</AppLayoutInner>
        <WelcomeModal />
      </OnboardingProvider>
    </CreditsProvider>
  );
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { credits } = useCredits();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    // Dev mode: just redirect
    if (process.env.NEXT_PUBLIC_DEV_USER_ID) {
      window.location.href = "/";
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 border-b-2 border-border bg-background">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <Image src="/K-big.png" alt="KeywordPeek" width={36} height={36} className="w-9 h-9" />
            <span className="font-mono font-bold text-sm uppercase tracking-widest text-foreground">[KEYWORDPEEK]</span>
          </Link>
          <div className="flex items-center gap-3">
            {credits !== null && (
              <CreditDisplay credits={credits} variant="compact" showBuyButton={false} />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <nav className="border-t-2 border-border bg-card p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-all duration-200 font-medium no-underline",
                  pathname === item.href
                    ? "bg-primary/15 text-primary border-2 border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-2 border-transparent"
                )}
              >
                <span className="text-lg">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
            <div className="border-t-2 border-border my-3" />
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-all duration-200 font-medium no-underline",
                  pathname === item.href
                    ? "bg-primary/15 text-primary border-2 border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-2 border-transparent"
                )}
              >
                <span className="text-lg">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 font-medium border-2 border-transparent"
            >
              <span className="text-lg">👋</span>
              Sign out
            </button>
          </nav>
        )}
      </header>

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:left-0 z-50 border-r-2 border-border bg-card grain overflow-hidden">
          {/* Decorative shapes */}
          <QuarterCircle position="bottom-right" color="primary" size="lg" className="opacity-30" />
          <Circle position={{ top: "12%", right: "8%" }} color="secondary" size="sm" className="opacity-40" />

          {/* Logo */}
          <div className="flex items-center gap-3 h-20 px-6 border-b-2 border-border relative z-10">
            <Link href="/dashboard" className="flex items-center gap-3 no-underline">
              <Image src="/K-big.png" alt="KeywordPeek" width={40} height={40} className="w-10 h-10" />
              <span className="font-mono font-bold text-base uppercase tracking-widest text-foreground">[KEYWORDPEEK]</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-all duration-200 font-medium no-underline",
                  pathname === item.href
                    ? "bg-primary/15 text-primary border-2 border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-2 border-transparent hover:border-border"
                )}
              >
                <div className={cn(
                  "w-9 h-9 flex items-center justify-center transition-all duration-200",
                  pathname === item.href ? "bg-primary/20" : "bg-muted"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                {item.label}
                {pathname === item.href && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Link>
            ))}
          </nav>

          {/* Credit display */}
          <div className="px-4 py-5 border-t-2 border-border bg-accent/50 grain-logo relative">
            {credits !== null && (
              <CreditDisplay credits={credits} variant="default" showBuyButton={false} />
            )}
            <Button
              asChild
              variant="primary"
              className="w-full mt-4 gap-2"
            >
              <Link href="/account">
                <Sparkles className="h-4 w-4" />
                Buy more credits
              </Link>
            </Button>
          </div>

          {/* Bottom navigation */}
          <div className="px-4 py-4 border-t-2 border-border space-y-1 relative z-10">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 font-medium no-underline",
                  pathname.startsWith(item.href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
