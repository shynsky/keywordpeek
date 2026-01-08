"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  FolderOpen,
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

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  emoji: string;
}

const navItems: NavItem[] = [
  { label: "Research", href: "/dashboard", icon: Search, emoji: "🔍" },
  { label: "Projects", href: "/dashboard/projects", icon: FolderOpen, emoji: "📁" },
];

const bottomNavItems: NavItem[] = [
  { label: "Buy Credits", href: "/account", icon: Coins, emoji: "💰" },
  { label: "Settings", href: "/account/settings", icon: Settings, emoji: "⚙️" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [credits, setCredits] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCredits = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", user.id)
          .single();

        if (profile) {
          setCredits(profile.credits);
        }
      }
    };

    fetchCredits();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-playful">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-lg">KeywordPeek</span>
          </Link>
          <div className="flex items-center gap-3">
            {credits !== null && (
              <CreditDisplay credits={credits} variant="compact" showBuyButton={false} />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl"
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
          <nav className="border-t-2 border-border bg-card p-4 space-y-2 animate-fade-in-up">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
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
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 font-medium border-2 border-transparent"
            >
              <span className="text-lg">👋</span>
              Sign out
            </button>
          </nav>
        )}
      </header>

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 border-r-2 border-border bg-card">
          {/* Logo */}
          <div className="flex items-center gap-3 h-20 px-6 border-b-2 border-border">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-playful animate-float">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="font-bold text-xl">KeywordPeek</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium animate-fade-in-up",
                  pathname === item.href
                    ? "bg-primary/15 text-primary border-2 border-primary/30 shadow-playful"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-2 border-transparent hover:border-border"
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
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
          <div className="px-4 py-5 border-t-2 border-border bg-muted/30">
            {credits !== null && (
              <CreditDisplay credits={credits} variant="default" showBuyButton={false} />
            )}
            <Button
              asChild
              variant="gradient"
              className="w-full mt-4 gap-2"
            >
              <Link href="/account">
                <Sparkles className="h-4 w-4" />
                Buy more credits
              </Link>
            </Button>
          </div>

          {/* Bottom navigation */}
          <div className="px-4 py-4 border-t-2 border-border space-y-1">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 font-medium",
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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:pl-72 flex-1 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
