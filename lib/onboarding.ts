// Onboarding state management for new users

export type OnboardingIntent =
  | "validating_idea"
  | "starting_seo"
  | "market_research"
  | "exploring";

export interface OnboardingState {
  version: 1;
  intent: OnboardingIntent | null;
  completedSteps: {
    welcomeModal: boolean;
    firstSearch: boolean;
    viewedResultsEducation: boolean;
    triedRelatedKeywords: boolean;
    triedPAAQuestions: boolean;
    seenProjectPrompt: boolean;
  };
  dismissedAt: string | null;
  startedAt: string;
  searchCount: number;
}

const STORAGE_KEY = "keywordpeek_onboarding";

const DEFAULT_STATE: OnboardingState = {
  version: 1,
  intent: null,
  completedSteps: {
    welcomeModal: false,
    firstSearch: false,
    viewedResultsEducation: false,
    triedRelatedKeywords: false,
    triedPAAQuestions: false,
    seenProjectPrompt: false,
  },
  dismissedAt: null,
  startedAt: new Date().toISOString(),
  searchCount: 0,
};

export function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;

    const parsed = JSON.parse(stored) as OnboardingState;
    // Validate version
    if (parsed.version !== 1) return DEFAULT_STATE;
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveOnboardingState(state: OnboardingState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage might be full or disabled
  }
}

export function shouldShowOnboarding(state: OnboardingState): boolean {
  // Don't show if user has dismissed
  if (state.dismissedAt) return false;

  // Show if welcome modal hasn't been completed
  if (!state.completedSteps.welcomeModal) return true;

  // Show if user selected intent but hasn't done first search
  if (state.intent && !state.completedSteps.firstSearch) return true;

  return false;
}

export function isOnboardingActive(state: OnboardingState): boolean {
  // Onboarding is active if not dismissed and not all steps completed
  if (state.dismissedAt) return false;

  const steps = state.completedSteps;
  const allCompleted =
    steps.welcomeModal &&
    steps.firstSearch &&
    steps.viewedResultsEducation &&
    steps.seenProjectPrompt;

  return !allCompleted;
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Pre-filled search suggestions by intent
export interface SuggestionCard {
  id: string;
  keywords: string[];
  title: string;
  description: string;
  emoji: string;
}

const IDEA_VALIDATION_SUGGESTIONS: SuggestionCard[] = [
  {
    id: "ai-writing",
    keywords: ["ai writing assistant", "ai content writer", "ai copywriting tool"],
    title: "AI Writing Tools",
    description: "See how many people search for AI writing solutions",
    emoji: "🤖",
  },
  {
    id: "meal-delivery",
    keywords: ["meal prep delivery", "healthy meal delivery", "diet food delivery"],
    title: "Meal Delivery Services",
    description: "Explore demand for meal delivery businesses",
    emoji: "🥗",
  },
  {
    id: "finance-apps",
    keywords: ["personal finance app", "budget tracking app", "expense tracker"],
    title: "Finance Apps",
    description: "Check interest in personal finance tools",
    emoji: "💰",
  },
];

const SEO_STARTER_SUGGESTIONS: SuggestionCard[] = [
  {
    id: "blogging",
    keywords: ["how to start a blog", "blogging for beginners", "start blog 2025"],
    title: "Blogging Keywords",
    description: "Popular searches for new bloggers",
    emoji: "✍️",
  },
  {
    id: "small-biz-seo",
    keywords: ["seo tips for small business", "local seo guide", "small business seo"],
    title: "Small Business SEO",
    description: "What small businesses search for",
    emoji: "🏪",
  },
  {
    id: "productivity",
    keywords: ["best productivity tools", "productivity apps", "time management software"],
    title: "Productivity Niche",
    description: "A competitive but lucrative niche",
    emoji: "⚡",
  },
];

const MARKET_RESEARCH_SUGGESTIONS: SuggestionCard[] = [
  {
    id: "pm-software",
    keywords: ["project management software", "task management tool", "team collaboration app"],
    title: "Project Management Market",
    description: "Analyze the PM software landscape",
    emoji: "📊",
  },
  {
    id: "elearning",
    keywords: ["online course platform", "e-learning software", "course creation tool"],
    title: "E-Learning Industry",
    description: "Explore the online education market",
    emoji: "🎓",
  },
  {
    id: "crm",
    keywords: ["crm software", "sales management tool", "customer database software"],
    title: "CRM Market",
    description: "Research the CRM industry",
    emoji: "📈",
  },
];

const EXPLORING_SUGGESTIONS: SuggestionCard[] = [
  {
    id: "coffee",
    keywords: ["coffee shop near me", "best coffee beans", "espresso machine"],
    title: "Coffee Keywords",
    description: "See how keyword metrics work",
    emoji: "☕",
  },
  {
    id: "wellness",
    keywords: ["yoga for beginners", "meditation app", "mindfulness exercises"],
    title: "Wellness Keywords",
    description: "Explore a popular niche",
    emoji: "🧘",
  },
  {
    id: "tech",
    keywords: ["iphone 16 review", "best smartphone 2025", "android vs iphone"],
    title: "Tech Keywords",
    description: "High-volume competitive keywords",
    emoji: "📱",
  },
];

export function getSuggestionsForIntent(intent: OnboardingIntent | null): SuggestionCard[] {
  switch (intent) {
    case "validating_idea":
      return IDEA_VALIDATION_SUGGESTIONS;
    case "starting_seo":
      return SEO_STARTER_SUGGESTIONS;
    case "market_research":
      return MARKET_RESEARCH_SUGGESTIONS;
    case "exploring":
      return EXPLORING_SUGGESTIONS;
    default:
      return EXPLORING_SUGGESTIONS;
  }
}

// Intent display info
export interface IntentOption {
  id: OnboardingIntent;
  title: string;
  description: string;
  emoji: string;
}

export const INTENT_OPTIONS: IntentOption[] = [
  {
    id: "validating_idea",
    title: "Validating an Idea",
    description: "I have a product idea and want to check demand",
    emoji: "💡",
  },
  {
    id: "starting_seo",
    title: "Starting SEO",
    description: "I'm building a website and want to rank",
    emoji: "🚀",
  },
  {
    id: "market_research",
    title: "Market Research",
    description: "I'm researching a market or competitors",
    emoji: "🔬",
  },
  {
    id: "exploring",
    title: "Just Exploring",
    description: "Show me what this tool can do",
    emoji: "👀",
  },
];
