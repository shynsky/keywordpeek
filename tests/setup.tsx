import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Stripe client to avoid env var requirement
vi.mock("@/lib/stripe/client", () => ({
  stripe: {},
  CREDIT_PACKAGES: {
    starter: {
      id: "starter",
      name: "Starter",
      credits: 1000,
      price: 900,
      priceDisplay: "$9",
      perKeyword: "$0.009",
      popular: false,
    },
    growth: {
      id: "growth",
      name: "Growth",
      credits: 3000,
      price: 1900,
      priceDisplay: "$19",
      perKeyword: "$0.006",
      popular: true,
    },
    pro: {
      id: "pro",
      name: "Pro",
      credits: 10000,
      price: 4900,
      priceDisplay: "$49",
      perKeyword: "$0.005",
      popular: false,
    },
  },
  getPackage: (packageId: string) => {
    const packages: Record<string, { id: string; credits: number }> = {
      starter: { id: "starter", credits: 1000 },
      growth: { id: "growth", credits: 3000 },
      pro: { id: "pro", credits: 10000 },
    };
    return packages[packageId];
  },
  createCheckoutSession: vi.fn(),
  constructWebhookEvent: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Coins: () => <span data-testid="icon-coins" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  Plus: () => <span data-testid="icon-plus" />,
  Download: () => <span data-testid="icon-download" />,
  FileSpreadsheet: () => <span data-testid="icon-spreadsheet" />,
  TrendingUp: () => <span data-testid="icon-trending-up" />,
  TrendingDown: () => <span data-testid="icon-trending-down" />,
  Minus: () => <span data-testid="icon-minus" />,
  ArrowUpDown: () => <span data-testid="icon-sort" />,
  ArrowUp: () => <span data-testid="icon-sort-up" />,
  ArrowDown: () => <span data-testid="icon-sort-down" />,
  Save: () => <span data-testid="icon-save" />,
  ExternalLink: () => <span data-testid="icon-external" />,
  MoreHorizontal: () => <span data-testid="icon-more" />,
}));

// Mock URL.createObjectURL and revokeObjectURL for CSV export tests
global.URL.createObjectURL = vi.fn(() => "blob:test-url");
global.URL.revokeObjectURL = vi.fn();

// Mock window.open
Object.defineProperty(window, "open", {
  value: vi.fn(),
  writable: true,
});

// Mock clipboard API
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
  writable: true,
});
