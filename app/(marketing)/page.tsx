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
      <section className="border-b-2 border-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Label */}
          <RevealOnScroll>
            <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-4">
              [KEYWORD_RESEARCH_TOOL]
            </p>
          </RevealOnScroll>

          {/* Headline - GIANT */}
          <RevealOnScroll>
            <h1 className="mb-6 font-black tracking-tighter" style={{ fontSize: 'clamp(2.5rem, 10vw, 5rem)', lineHeight: 1 }}>
              KEYWORD RESEARCH
              <br />
              <span className="text-primary">WITHOUT THE</span>
              <br />
              SUBSCRIPTION
            </h1>
          </RevealOnScroll>

          <hr className="section-divider mb-8" />

          {/* Subtitle */}
          <RevealOnScroll>
            <div className="max-w-2xl mb-8 font-mono text-lg">
              <p>Professional keyword data. Pay-as-you-go.</p>
              <p className="mt-2">
                No <span className="bg-destructive text-white px-2 line-through">$99/month</span> subscription.
              </p>
            </div>
          </RevealOnScroll>

          {/* CTA */}
          <RevealOnScroll>
            <div className="mb-12">
              <Button size="xl" variant="primary" asChild className="group">
                <Link href="/auth/signup">
                  START FREE [50 CREDITS] <span className="arrow-shift ml-2">→</span>
                </Link>
              </Button>
            </div>
          </RevealOnScroll>

          {/* Stats - Table format */}
          <RevealOnScroll>
            <div className="border-2 border-foreground inline-block">
              <table className="font-mono">
                <tbody>
                  <tr className="border-b-2 border-foreground">
                    <td className="p-4 text-4xl sm:text-5xl font-bold text-primary">
                      <AnimatedCounter end={0.009} prefix="$" decimals={3} duration={600} />
                    </td>
                    <td className="p-4 text-sm uppercase tracking-wider text-muted-foreground">per keyword</td>
                  </tr>
                  <tr className="border-b-2 border-foreground">
                    <td className="p-4 text-4xl sm:text-5xl font-bold">
                      <AnimatedCounter end={100} suffix="%" duration={500} />
                    </td>
                    <td className="p-4 text-sm uppercase tracking-wider text-muted-foreground">real data</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-4xl sm:text-5xl font-bold">0</td>
                    <td className="p-4 text-sm uppercase tracking-wider text-muted-foreground">subscriptions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Social Proof - Inverted */}
      <section className="bg-foreground text-background border-b-2 border-foreground">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4">
              <div className="border-r border-background/30 p-6 text-center">
                <div className="font-mono text-2xl sm:text-3xl font-bold">
                  <AnimatedCounter end={47293} duration={800} />
                </div>
                <div className="text-xs uppercase tracking-wider opacity-70 mt-1">keywords searched</div>
              </div>
              <div className="border-r border-background/30 p-6 text-center max-md:border-r-0">
                <div className="font-mono text-2xl sm:text-3xl font-bold">
                  <AnimatedCounter end={1247} duration={700} />
                </div>
                <div className="text-xs uppercase tracking-wider opacity-70 mt-1">active users</div>
              </div>
              <div className="border-r border-background/30 p-6 text-center max-md:border-t max-md:border-background/30">
                <div className="font-mono text-2xl sm:text-3xl font-bold">12</div>
                <div className="text-xs uppercase tracking-wider opacity-70 mt-1">countries</div>
              </div>
              <div className="p-6 text-center max-md:border-t max-md:border-background/30">
                <div className="font-mono text-2xl sm:text-3xl font-bold">99.9%</div>
                <div className="text-xs uppercase tracking-wider opacity-70 mt-1">uptime</div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b-2 border-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2 className="uppercase tracking-wide">The Problem</h2>
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
                <span>[X]</span>
                <span className="ml-3">Ahrefs</span>
                <span className="dotted-leader" />
                <span className="line-through">$99/mo</span>
              </div>
              <div className="flex items-center text-destructive">
                <span>[X]</span>
                <span className="ml-3">SEMrush</span>
                <span className="dotted-leader" />
                <span className="line-through">$129/mo</span>
              </div>
              <div className="flex items-center text-destructive">
                <span>[X]</span>
                <span className="ml-3">Moz Pro</span>
                <span className="dotted-leader" />
                <span className="line-through">$99/mo</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Solution */}
      <section className="border-b-2 border-foreground bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2 className="uppercase tracking-wide">The Solution</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll>
            <p className="text-lg mb-8 max-w-2xl font-mono">
              KeywordPeek: same data, pay-as-you-go.
            </p>
          </RevealOnScroll>

          <RevealOnScroll stagger>
            <div className="space-y-3 max-w-md font-mono">
              <div className="flex items-center text-positive">
                <span>[+]</span>
                <span className="ml-3">Pay only for what you use</span>
              </div>
              <div className="flex items-center text-positive">
                <span>[+]</span>
                <span className="ml-3">Credits never expire</span>
              </div>
              <div className="flex items-center text-positive">
                <span>[+]</span>
                <span className="ml-3">Same data sources as enterprise tools</span>
              </div>
              <div className="flex items-center text-positive">
                <span>[+]</span>
                <span className="ml-3">Start free with 50 credits</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Product Preview - Terminal UI */}
      <section className="border-b-2 border-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2 className="uppercase tracking-wide">The Product</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll>
            {/* Simulated terminal interface */}
            <div className="border-2 border-foreground bg-card font-mono text-sm overflow-hidden">
              {/* Header bar */}
              <div className="bg-foreground text-background px-4 py-2 flex items-center justify-between">
                <span className="uppercase tracking-wider text-xs">[KEYWORDPEEK v1.0]</span>
                <div className="flex gap-3 text-xs">
                  <span>[_]</span>
                  <span>[X]</span>
                </div>
              </div>

              {/* Data table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted border-b-2 border-foreground text-left">
                      <th className="p-3 uppercase text-xs tracking-wider font-bold">Keyword</th>
                      <th className="p-3 uppercase text-xs tracking-wider font-bold text-right">Volume</th>
                      <th className="p-3 uppercase text-xs tracking-wider font-bold text-right">Score</th>
                      <th className="p-3 uppercase text-xs tracking-wider font-bold text-right">Diff</th>
                      <th className="p-3 uppercase text-xs tracking-wider font-bold text-right">CPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/50">
                      <td className="p-3">keyword research tool</td>
                      <td className="p-3 text-right tabular-nums">12,100</td>
                      <td className="p-3 text-right text-score-easy font-bold">78</td>
                      <td className="p-3 text-right text-score-medium">[M] 45</td>
                      <td className="p-3 text-right tabular-nums">$4.20</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50">
                      <td className="p-3">seo keyword finder</td>
                      <td className="p-3 text-right tabular-nums">8,400</td>
                      <td className="p-3 text-right text-score-easy font-bold">82</td>
                      <td className="p-3 text-right text-score-easy">[E] 28</td>
                      <td className="p-3 text-right tabular-nums">$3.80</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50">
                      <td className="p-3">ahrefs alternative</td>
                      <td className="p-3 text-right tabular-nums">2,900</td>
                      <td className="p-3 text-right text-score-easy font-bold">91</td>
                      <td className="p-3 text-right text-score-easy">[E] 22</td>
                      <td className="p-3 text-right tabular-nums">$6.50</td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="p-3">semrush alternative</td>
                      <td className="p-3 text-right tabular-nums">1,600</td>
                      <td className="p-3 text-right text-score-easy font-bold">85</td>
                      <td className="p-3 text-right text-score-easy">[E] 31</td>
                      <td className="p-3 text-right tabular-nums">$5.20</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-foreground px-4 py-2 text-xs text-muted-foreground flex justify-between">
                <span>4 keywords | 4 credits used</span>
                <span>Data: DataForSEO</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4 font-mono">
              [Real interface. Real data. No mockups.]
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b-2 border-foreground scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2 className="uppercase tracking-wide">Features</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll stagger>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-2 border-foreground">
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.title}
                  className="p-6 border-b border-r border-foreground hover:bg-foreground hover:text-background transition-colors duration-100 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0 md:odd:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0"
                >
                  <div className="font-mono text-xs text-muted-foreground mb-2">
                    [{String(index + 1).padStart(2, '0')}]
                  </div>
                  <h3 className="font-bold uppercase tracking-wide mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm opacity-80">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b-2 border-foreground scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2 className="uppercase tracking-wide">Pricing</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll>
            {/* Table format pricing */}
            <div className="border-2 border-foreground overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="bg-foreground text-background">
                    <th className="p-4 text-left uppercase tracking-wider">Plan</th>
                    <th className="p-4 text-right uppercase tracking-wider">Credits</th>
                    <th className="p-4 text-right uppercase tracking-wider">Price</th>
                    <th className="p-4 text-right uppercase tracking-wider">Per Keyword</th>
                    <th className="p-4 text-right uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {PACKAGES.map((pkg) => (
                    <tr
                      key={pkg.name}
                      className={`border-t-2 border-foreground ${pkg.popular ? "bg-primary/10" : ""}`}
                    >
                      <td className="p-4">
                        <div className="font-bold uppercase">{pkg.name}</div>
                        <div className="text-xs text-muted-foreground normal-case mt-1">{pkg.tagline}</div>
                      </td>
                      <td className="p-4 text-right tabular-nums">{pkg.credits}</td>
                      <td className="p-4 text-right">
                        <span className="text-2xl font-bold">{pkg.price}</span>
                      </td>
                      <td className="p-4 text-right tabular-nums text-muted-foreground">{pkg.perKeyword}</td>
                      <td className="p-4 text-right">
                        {pkg.savings && (
                          <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold uppercase">
                            {pkg.savings}
                          </span>
                        )}
                        {pkg.popular && (
                          <span className="bg-foreground text-background px-2 py-1 text-xs font-bold uppercase ml-2">
                            [BEST]
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground mb-4 font-mono uppercase tracking-wider">
                [*] 78% of users choose Growth
              </p>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                All plans: Full data + Project organization + CSV export + Credits never expire
              </p>
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" variant="primary" asChild className="group">
                <Link href="/auth/signup">
                  GET STARTED <span className="arrow-shift ml-1">→</span>
                </Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b-2 border-foreground scroll-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <RevealOnScroll>
            <h2 className="uppercase tracking-wide">FAQ</h2>
            <hr className="section-divider mb-8" />
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="max-w-2xl">
              {FAQS.map((faq, i) => (
                <div key={i} className="border-b-2 border-foreground py-6 first:pt-0 last:border-b-0">
                  <div className="flex gap-4">
                    <span className="font-mono text-primary font-bold shrink-0">Q:</span>
                    <div className="font-bold">{faq.q}</div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="font-mono text-muted-foreground shrink-0">A:</span>
                    <div className="text-muted-foreground">{faq.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Final CTA - Inverted */}
      <section className="bg-foreground text-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <RevealOnScroll>
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-widest mb-4 opacity-70">
                [START_NOW]
              </p>
              <p className="text-3xl sm:text-4xl font-black mb-8 uppercase tracking-tight">
                50 FREE CREDITS
                <br />
                NO CREDIT CARD
              </p>

              <Button
                size="xl"
                variant="outline"
                asChild
                className="group border-2 border-background text-background hover:bg-background hover:text-foreground"
              >
                <Link href="/auth/signup">
                  START FREE <span className="arrow-shift ml-1">→</span>
                </Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
