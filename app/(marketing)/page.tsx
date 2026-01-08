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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/20 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              50 free credits to start
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
              Keyword research
              <br />
              <span className="text-accent">without the subscription</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional keyword data at pay-as-you-go prices. Perfect for
              bootstrappers, indie hackers, and anyone tired of $99/month SEO
              tools.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="text-base px-8">
                <Link href="/auth/signup">
                  Start Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. 50 free credits included.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold">$0.009</div>
              <div className="text-sm text-muted-foreground mt-1">per keyword</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold">100%</div>
              <div className="text-sm text-muted-foreground mt-1">data accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold">0</div>
              <div className="text-sm text-muted-foreground mt-1">subscriptions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="border-y bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold mb-4">
                You don&apos;t need another $99/month tool
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Most keyword tools are built for agencies running dozens of
                campaigns. But if you&apos;re building a blog, launching a product, or
                doing occasional research—why pay enterprise prices?
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-score-hard/10 flex items-center justify-center mt-0.5">
                    <span className="text-score-hard text-sm">✕</span>
                  </div>
                  <span className="text-muted-foreground">
                    Ahrefs starts at $99/month
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-score-hard/10 flex items-center justify-center mt-0.5">
                    <span className="text-score-hard text-sm">✕</span>
                  </div>
                  <span className="text-muted-foreground">
                    SEMrush starts at $129/month
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-score-hard/10 flex items-center justify-center mt-0.5">
                    <span className="text-score-hard text-sm">✕</span>
                  </div>
                  <span className="text-muted-foreground">
                    Moz Pro starts at $99/month
                  </span>
                </li>
              </ul>
            </div>
            <div className="lg:pl-12">
              <div className="p-8 rounded-2xl bg-card border">
                <h3 className="text-xl font-display font-semibold mb-4 text-score-easy">
                  KeywordPeek is different
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-score-easy mt-0.5" />
                    <span>Pay only for what you use</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-score-easy mt-0.5" />
                    <span>Credits never expire</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-score-easy mt-0.5" />
                    <span>Same quality data as the big tools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-score-easy mt-0.5" />
                    <span>Start free with 50 credits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Everything you need for keyword research
            </h2>
            <p className="text-muted-foreground text-lg">
              Professional-grade data without the professional-grade price tag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border bg-card hover:border-accent/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-y bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              No subscriptions. No hidden fees. Just credits that never expire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "relative p-8 rounded-2xl border bg-card",
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

                <div className="text-center mb-8">
                  <h3 className="font-display font-semibold text-xl mb-2">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-display font-bold">{pkg.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {pkg.perKeyword} per keyword
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-score-easy" />
                    <span>{pkg.credits.toLocaleString()} credits</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-score-easy" />
                    <span>Never expires</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-score-easy" />
                    <span>Full keyword data</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-score-easy" />
                    <span>Project organization</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-score-easy" />
                    <span>CSV export</span>
                  </li>
                </ul>

                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Start with 50 free credits. No credit card required.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border bg-card"
              >
                <h3 className="font-display font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to find your keywords?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Start with 50 free credits. No credit card required. Find the
            keywords that will drive traffic to your site.
          </p>
          <Button size="lg" asChild className="text-base px-8">
            <Link href="/auth/signup">
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
