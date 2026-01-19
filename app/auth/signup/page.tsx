"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, Lock, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/utils/get-app-url";
import { QuarterCircle, Circle } from "@/components/decorations/geometric-shapes";

const BENEFITS = [
  "10 free searches to start",
  "No credit card required",
  "Pay-as-you-go pricing",
  "Accurate keyword data",
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getAppUrl()}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  const handleGoogleSignup = async () => {
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
        <QuarterCircle position="top-right" color="primary" size="xl" />
        <QuarterCircle position="bottom-left" color="secondary" size="lg" />

        <div className="max-w-md text-center relative z-10">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-positive/20 border-2 border-positive">
            <Check className="h-8 w-8 text-positive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            Check your email
          </h1>
          <p className="text-muted-foreground mb-6">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the
            link to verify your account and start researching keywords.
          </p>
          <Button variant="outline" asChild>
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-primary p-12 relative overflow-hidden grain">
        {/* Geometric decorations */}
        <QuarterCircle position="top-right" color="secondary" size="xl" />
        <QuarterCircle position="bottom-left" color="accent" size="lg" />
        <Circle position={{ bottom: "30%", right: "10%" }} color="secondary" size="sm" />

        <div className="max-w-md relative z-10 text-primary-foreground">
          <div className="mb-8 inline-flex items-center justify-center w-16 h-16 bg-primary-foreground/20 border-2 border-primary-foreground">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Start researching in seconds
          </h2>
          <p className="opacity-90 leading-relaxed mb-8">
            Join thousands of bootstrappers who use KeywordPeek to find
            profitable keywords without expensive monthly subscriptions.
          </p>
          <ul className="space-y-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-positive/30 border-2 border-positive flex items-center justify-center">
                  <Check className="h-3 w-3 text-positive" />
                </div>
                <span className="opacity-90">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 no-underline">
            <Image src="/K-big.png" alt="KeywordPeek" width={32} height={32} className="w-8 h-8" />
            <span className="font-mono font-bold text-sm uppercase tracking-widest text-foreground">[KEYWORDPEEK]</span>
          </Link>

          <h1 className="text-2xl font-bold mb-2">
            Create your account
          </h1>
          <p className="text-muted-foreground mb-8">
            Get started with 10 free searches. No credit card required.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border-2 border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Google Signup */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 h-11"
            onClick={handleGoogleSignup}
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
            Sign up with Google
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

          {/* Email Signup Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
