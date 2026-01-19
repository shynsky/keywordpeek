"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/utils/get-app-url";
import { QuarterCircle, Circle } from "@/components/decorations/geometric-shapes";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getAppUrl()}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 no-underline">
            <Image src="/K-big.png" alt="KeywordPeek" width={32} height={32} className="w-8 h-8" />
            <span className="font-mono font-bold text-sm uppercase tracking-widest text-foreground">[KEYWORDPEEK]</span>
          </Link>

          <h1 className="text-2xl font-bold mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to continue your keyword research.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border-2 border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 h-11"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-accent p-12 relative overflow-hidden grain">
        {/* Geometric decorations */}
        <QuarterCircle position="top-left" color="primary" size="xl" />
        <QuarterCircle position="bottom-right" color="secondary" size="lg" />
        <Circle position={{ top: "20%", right: "15%" }} color="primary" size="sm" />

        <div className="max-w-md text-center relative z-10">
          <div className="mb-8 inline-flex items-center justify-center w-16 h-16 bg-primary/20 border-2 border-primary">
            <span className="text-4xl">🎯</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Keyword research, simplified
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            No subscriptions. No commitments. Just pay for what you use and get
            instant access to search volumes, difficulty scores, and trend data.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center border-2 border-foreground bg-card">
            <div className="p-4 border-r-2 border-foreground">
              <div className="text-2xl font-bold text-primary font-mono">50</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Free credits</div>
            </div>
            <div className="p-4 border-r-2 border-foreground">
              <div className="text-2xl font-bold text-secondary font-mono">$0.009</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Per keyword</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold font-mono">100%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Data accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
