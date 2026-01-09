import Link from "next/link";
import {
  Search,
  TrendingUp,
  DollarSign,
  Zap,
  Target,
  BarChart3,
  Check,
  ArrowRight,
  Sparkles,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Search,
    title: "Instant Search Volume",
    description:
      "Get accurate monthly search volumes for any keyword. No guessing, no estimates—real data.",
  },
  {
    icon: Target,
    title: "Keyword Score",
    description:
      "Our 0-100 score factors volume, competition, and CPC to show you the best opportunities at a glance.",
  },
  {
    icon: TrendingUp,
    title: "12-Month Trends",
    description:
      "Spot seasonal patterns and rising topics with historical trend data for every keyword.",
  },
  {
    icon: BarChart3,
    title: "Difficulty Analysis",
    description:
      "Know exactly how hard it is to rank. Make informed decisions about which keywords to target.",
  },
  {
    icon: DollarSign,
    title: "CPC Data",
    description:
      "See what advertisers pay. High CPC keywords often indicate commercial intent worth targeting.",
  },
  {
    icon: Zap,
    title: "Bulk Research",
    description:
      "Research up to 100 keywords at once. Save time and get comprehensive data in seconds.",
  },
];

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

const FAQS = [
  {
    question: "How does pay-as-you-go work?",
    answer:
      "You purchase credit packs that never expire. Each keyword search costs 1 credit. No subscriptions, no recurring charges—just buy more when you need them.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "We use DataForSEO, one of the most reliable keyword data providers in the industry. You get the same quality data as enterprise SEO tools.",
  },
  {
    question: "Do credits expire?",
    answer:
      "No! Your credits never expire. Use them whenever you need them, at your own pace.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Unused credits are non-refundable, but since they never expire, you can always use them later. We offer 50 free credits so you can try before you buy.",
  },
  {
    question: "What counts as 1 credit?",
    answer:
      "Searching for 1 keyword = 1 credit. If you search for 10 keywords at once, that's 10 credits. Viewing saved keywords doesn't cost anything.",
  },
  {
    question: "Is there an API?",
    answer:
      "Not yet, but it's on the roadmap. For now, KeywordPeek is a web app focused on quick, manual keyword research.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        {/* Subtle organic background shape */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] -translate-y-1/4 translate-x-1/4 opacity-60">
            <div className="w-full h-full blob-coral animate-float-gentle" />
          </div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] translate-y-1/4 -translate-x-1/4 opacity-40">
            <div className="w-full h-full blob-sage animate-float-slow" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in-soft">
              <Sparkles className="h-4 w-4" />
              50 free credits to start
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 animate-fade-in-soft stagger-1">
              Keyword research
              <br />
              <span className="text-primary">without the subscription</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-soft stagger-2">
              Professional keyword data at pay-as-you-go prices. Perfect for
              bootstrappers, indie hackers, and anyone tired of{" "}
              <span className="line-through text-muted-foreground/60">$99/month</span>{" "}
              SEO tools.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-soft stagger-3">
              <Button size="xl" asChild className="gap-2 text-base">
                <Link href="/auth/signup">
                  Start Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="text-base">
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground animate-fade-in-soft stagger-4">
              No credit card required • 50 free credits included
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { value: "$0.009", label: "per keyword", icon: DollarSign },
              { value: "100%", label: "data accuracy", icon: CheckCircle },
              { value: "0", label: "subscriptions", icon: XCircle },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "text-center p-6 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-warm-lg transition-all duration-300 animate-fade-in-soft",
                )}
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <stat.icon className="h-5 w-5 mx-auto mb-3 text-muted-foreground" />
                <div className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="border-y border-border bg-muted/20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-6">
                The Problem
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                You don&apos;t need another{" "}
                <span className="text-destructive">$99/month</span> tool
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Most keyword tools are built for agencies running dozens of
                campaigns. But if you&apos;re building a blog, launching a product, or
                doing occasional research—why pay enterprise prices?
              </p>
              <ul className="space-y-4">
                {[
                  { tool: "Ahrefs", price: "$99/month" },
                  { tool: "SEMrush", price: "$129/month" },
                  { tool: "Moz Pro", price: "$99/month" },
                ].map((item) => (
                  <li key={item.tool} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <X className="h-5 w-5 text-destructive" />
                    </div>
                    <span className="text-muted-foreground text-lg">
                      {item.tool} starts at{" "}
                      <span className="line-through">{item.price}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:pl-8">
              <div className="p-8 sm:p-10 rounded-2xl bg-card border border-score-easy/30 shadow-warm-lg">
                <span className="inline-block px-3 py-1.5 rounded-full bg-score-easy/10 text-score-easy text-sm font-medium mb-6">
                  The Solution
                </span>
                <h3 className="text-2xl font-bold mb-6 text-score-easy">
                  KeywordPeek is different
                </h3>
                <ul className="space-y-4">
                  {[
                    "Pay only for what you use",
                    "Credits never expire",
                    "Same quality data as the big tools",
                    "Start free with 50 credits",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-score-easy/15 flex items-center justify-center">
                        <Check className="h-5 w-5 text-score-easy" />
                      </div>
                      <span className="text-lg font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Everything you need for{" "}
              <span className="text-primary">keyword research</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Professional-grade data without the professional-grade price tag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={cn(
                  "group p-8 rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-warm-lg hover:border-primary/20",
                  "animate-fade-in-soft"
                )}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-all duration-300",
                    "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  )}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-y border-border bg-gradient-to-b from-muted/30 to-background relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1.5 rounded-full bg-accent/15 text-accent-foreground text-sm font-medium mb-6">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Simple, <span className="text-primary">transparent</span> pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              No subscriptions. No hidden fees. Just credits that never expire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PACKAGES.map((pkg, i) => (
              <div
                key={pkg.id}
                className={cn(
                  "relative p-8 sm:p-10 rounded-2xl border bg-card transition-all duration-300 animate-fade-in-soft",
                  pkg.popular
                    ? "border-primary shadow-warm-xl scale-105 z-10"
                    : "border-border hover:border-primary/20 hover:shadow-warm-lg"
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="font-semibold text-xl mb-4">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={cn(
                      "text-5xl font-bold",
                      pkg.popular && "text-primary"
                    )}>
                      {pkg.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {pkg.perKeyword} per keyword
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    `${pkg.credits.toLocaleString()} credits`,
                    "Never expires",
                    "Full keyword data",
                    "Project organization",
                    "CSV export",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-md bg-score-easy/15 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-score-easy" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  size="lg"
                  variant={pkg.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-12 text-sm">
            Start with 50 free credits. No credit card required.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1.5 rounded-full bg-accent-secondary/10 text-accent-secondary text-sm font-medium mb-6">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-warm transition-all duration-300 animate-fade-in-soft"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    Q
                  </span>
                  {faq.question}
                </h3>
                <p className="text-muted-foreground pl-10 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px]">
            <div className="w-full h-full bg-gradient-radial from-primary/8 via-transparent to-transparent blur-3xl" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to find your <span className="text-primary">perfect keywords</span>?
          </h2>
          <p className="text-muted-foreground text-xl mb-10 max-w-xl mx-auto">
            Start with 50 free credits. No credit card required. Find the
            keywords that will drive traffic to your site.
          </p>
          <Button size="xl" asChild className="gap-2 text-lg">
            <Link href="/auth/signup">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
