'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/animated-counter";
import { RevealOnScroll } from "@/lib/hooks/use-reveal";

const FEATURES = [
  {
    title: "Search Volume",
    description: "Accurate monthly search volumes. Real data, not estimates.",
  },
  {
    title: "Keyword Score",
    description: "0-100 score factoring volume, competition, and CPC. Best opportunities at a glance.",
  },
  {
    title: "12-Month Trends",
    description: "Spot seasonal patterns. Historical trend data for every keyword.",
  },
  {
    title: "Difficulty Analysis",
    description: "Know how hard it is to rank. Make informed targeting decisions.",
  },
  {
    title: "CPC Data",
    description: "See what advertisers pay. High CPC = commercial intent.",
  },
  {
    title: "Bulk Research",
    description: "Up to 100 keywords at once. Seconds, not hours.",
  },
];

const PACKAGES = [
  { name: "Starter", credits: "1,000", price: "$9", perKeyword: "$0.009", popular: false, tagline: "Test the waters", savings: null },
  { name: "Growth", credits: "5,000", price: "$24", perKeyword: "$0.0048", popular: true, tagline: "Most users choose this", savings: "Save 47%" },
  { name: "Pro", credits: "12,000", price: "$79", perKeyword: "$0.0066", popular: false, tagline: "For agencies", savings: null },
];

const FAQS = [
  {
    q: "How does pay-as-you-go work?",
    a: "Buy credits. Use credits. 1 keyword = 1 credit. No subscriptions.",
  },
  {
    q: "Where does the data come from?",
    a: "DataForSEO — same source as enterprise tools.",
  },
  {
    q: "Do credits expire?",
    a: "No.",
  },
  {
    q: "Can I get a refund?",
    a: "Credits are non-refundable but never expire. Try free first with 50 credits.",
  },
  {
    q: "What counts as 1 credit?",
    a: "1 keyword search = 1 credit. Viewing saved keywords is free.",
  },
  {
    q: "Is there an API?",
    a: "Not yet. On the roadmap.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Headline */}
          <RevealOnScroll>
            <h1 className="mb-8">
              Keyword Research
              <br />
              Without The Subscription
            </h1>
          </RevealOnScroll>

          <hr className="section-divider mb-8" />

          {/* Subtitle */}
          <RevealOnScroll>
            <p className="text-lg sm:text-xl max-w-2xl mb-8 text-muted-foreground">
              Professional keyword data. Pay-as-you-go pricing.
              <br />
              No{" "}
              <span className="line-through text-destructive">$99/month</span>{" "}
              bullshit.
            </p>
          </RevealOnScroll>

          {/* CTA - Now filled/primary for high contrast */}
          <RevealOnScroll>
            <div className="mb-8">
              <Button size="lg" variant="primary" asChild className="group">
                <Link href="/auth/signup">
                  Start Free — 50 Credits <span className="arrow-shift">→</span>
                </Link>
              </Button>
            </div>
          </RevealOnScroll>

          {/* GIANT Stats */}
          <RevealOnScroll>
            <div className="hero-stats">
              <div className="stat-giant">
                <span className="stat-value">
                  <AnimatedCounter end={0.009} prefix="$" decimals={3} duration={800} />
                </span>
                <span className="stat-label">per keyword</span>
              </div>
              <div className="stat-giant">
                <span className="stat-value">
                  <AnimatedCounter end={100} suffix="%" duration={600} />
                </span>
                <span className="stat-label">accuracy</span>
              </div>
              <div className="stat-giant">
                <span className="stat-value">0</span>
                <span className="stat-label">subscriptions</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="social-proof-number">
              <AnimatedCounter end={47293} duration={1200} /> keywords searched
            </div>
            <div className="social-proof-label">this month</div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2>The Problem</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll>
            <p className="text-lg mb-8 max-w-2xl">
              You don&apos;t need enterprise software. Most keyword tools are built for agencies.
              You&apos;re not an agency.
            </p>
          </RevealOnScroll>

          <RevealOnScroll stagger>
            <div className="space-y-3 max-w-md font-mono">
              <div className="flex items-center text-destructive">
                <span>✗</span>
                <span className="ml-3">Ahrefs</span>
                <span className="dotted-leader" />
                <span className="line-through">$99/mo</span>
              </div>
              <div className="flex items-center text-destructive">
                <span>✗</span>
                <span className="ml-3">SEMrush</span>
                <span className="dotted-leader" />
                <span className="line-through">$129/mo</span>
              </div>
              <div className="flex items-center text-destructive">
                <span>✗</span>
                <span className="ml-3">Moz Pro</span>
                <span className="dotted-leader" />
                <span className="line-through">$99/mo</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Solution */}
      <section className="border-b border-foreground bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2>The Solution</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll>
            <p className="text-lg mb-8 max-w-2xl">
              KeywordPeek: same data, pay-as-you-go.
            </p>
          </RevealOnScroll>

          <RevealOnScroll stagger>
            <div className="space-y-3 max-w-md">
              <div className="flex items-center" style={{ color: "var(--positive)" }}>
                <span className="font-mono">✓</span>
                <span className="ml-3">Pay only for what you use</span>
              </div>
              <div className="flex items-center" style={{ color: "var(--positive)" }}>
                <span className="font-mono">✓</span>
                <span className="ml-3">Credits never expire</span>
              </div>
              <div className="flex items-center" style={{ color: "var(--positive)" }}>
                <span className="font-mono">✓</span>
                <span className="ml-3">Same data sources as enterprise tools</span>
              </div>
              <div className="flex items-center" style={{ color: "var(--positive)" }}>
                <span className="font-mono">✓</span>
                <span className="ml-3">Start free with 50 credits</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Product Preview */}
      <section className="border-b border-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2>The Product</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="screenshot-placeholder">
              <div className="screenshot-placeholder-text">
                [ Product screenshot coming soon ]
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Real interface. Real data. No mockups.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-foreground scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2>Features</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll stagger>
            <dl className="feature-list grid grid-cols-1 md:grid-cols-2 gap-x-16 max-w-4xl">
              {FEATURES.map((feature) => (
                <div key={feature.title}>
                  <dt>{feature.title}</dt>
                  <dd>{feature.description}</dd>
                </div>
              ))}
            </dl>
          </RevealOnScroll>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-foreground scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2>Pricing</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`border border-foreground p-6 md:p-8 relative ${
                    pkg.popular
                      ? "bg-foreground text-background md:scale-105 md:z-10 md:-my-4 md:py-12"
                      : ""
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-px left-0 right-0 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1.5 text-center">
                      Best Value
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="font-bold text-lg uppercase tracking-wide">
                      {pkg.name}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      pkg.popular ? "text-background/70" : "text-muted-foreground"
                    }`}>
                      {pkg.tagline}
                    </p>

                    <div className="mt-6">
                      <span className={`font-mono font-bold ${
                        pkg.popular ? "text-6xl" : "text-4xl"
                      }`}>
                        {pkg.price}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1">
                      <p className="font-mono text-lg">{pkg.credits} credits</p>
                      <p className={`font-mono text-sm ${
                        pkg.popular ? "text-background/70" : "text-muted-foreground"
                      }`}>
                        {pkg.perKeyword}/keyword
                      </p>
                    </div>

                    {pkg.savings && (
                      <p className="mt-4 text-sm font-bold bg-primary text-primary-foreground py-1 px-3 inline-block">
                        {pkg.savings}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground mb-4 font-mono uppercase tracking-wider">
                ★ 78% of users choose Growth
              </p>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                All plans include: Full keyword data, project organization, CSV export.
                Credits never expire.
              </p>
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" variant="primary" asChild className="group">
                <Link href="/auth/signup">
                  Get Started <span className="arrow-shift">→</span>
                </Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-foreground scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2>FAQ</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="max-w-2xl">
              {FAQS.map((faq, i) => (
                <div key={i} className="faq-item">
                  <div className="faq-question">Q: {faq.q}</div>
                  <div className="faq-answer">A: {faq.a}</div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <RevealOnScroll>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold mb-8">
                Ready? 50 free credits. No credit card.
              </p>

              <Button size="lg" variant="primary" asChild className="group">
                <Link href="/auth/signup">
                  Start Free <span className="arrow-shift">→</span>
                </Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
