# KeywordPeek.com - Implementation Plan

> Simple keyword research tool for bootstrappers. 80% of the value, 20% of the hassle.

## Overview

**Domain:** keywordpeek.com (Cloudflare)
**Stack:** Next.js 14 + Supabase + Stripe + Cloudflare Pages
**Data Provider:** DataForSEO API

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     KeywordPeek.com                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14 App Router)                          │
│  ├── Landing page (pricing, features)                       │
│  ├── Dashboard (keyword research UI)                        │
│  ├── Projects (workspaces for different sites)              │
│  └── Account (credits, usage, settings)                     │
├─────────────────────────────────────────────────────────────┤
│  API Routes (/app/api/)                                     │
│  ├── /api/keywords/search      - Main keyword lookup        │
│  ├── /api/keywords/suggestions - Autocomplete/related       │
│  ├── /api/keywords/questions   - People Also Ask            │
│  ├── /api/keywords/bulk        - Batch keyword check        │
│  ├── /api/projects             - CRUD for projects          │
│  ├── /api/credits/purchase     - Stripe checkout            │
│  └── /api/webhooks/stripe      - Payment webhooks           │
├─────────────────────────────────────────────────────────────┤
│  Supabase                                                   │
│  ├── Auth (email/password + Google OAuth)                   │
│  ├── Database (users, projects, keywords, credits)          │
│  └── Row Level Security (multi-tenant)                      │
├─────────────────────────────────────────────────────────────┤
│  External Services                                          │
│  ├── DataForSEO API (keyword data)                          │
│  ├── Stripe (payments)                                      │
│  └── Cloudflare Pages (hosting)                             │
└─────────────────────────────────────────────────────────────┘
```

## DataForSEO Integration

### APIs to Use

| API | Purpose | Cost (approx) |
|-----|---------|---------------|
| **Keywords Data API** | Search volume, CPC, competition, difficulty | $0.0015/keyword |
| **Google Autocomplete** | What people actually type, typos, variations | $0.0005/request |
| **Related Keywords** | "Also searched for" suggestions | $0.002/request |
| **People Also Ask** | Questions for content ideas | $0.002/request |
| **SERP API** | Who ranks, featured snippets (Phase 2) | $0.002/request |

### Keyword Data Response (what users see)

```typescript
interface KeywordResult {
  keyword: string
  searchVolume: number           // Monthly searches
  cpc: number                    // Cost per click ($)
  competition: 'low' | 'medium' | 'high'
  difficulty: number             // 0-100 score
  trend: number[]                // 12-month trend
  intent: 'informational' | 'transactional' | 'navigational'
  suggestions: string[]          // Related keywords
  questions: string[]            // People Also Ask
  autocomplete: string[]         // Google autocomplete variations
}
```

## Database Schema (Supabase)

```sql
-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  email text,
  credits int default 0,
  created_at timestamptz default now()
);

-- Projects (workspaces)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  name text not null,
  domain text,                    -- optional: associated website
  created_at timestamptz default now()
);

-- Saved Keywords
create table public.keywords (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects not null,
  keyword text not null,
  search_volume int,
  difficulty int,
  cpc numeric(10,2),
  data jsonb,                     -- full DataForSEO response
  status text default 'saved',    -- saved, targeting, published
  created_at timestamptz default now()
);

-- Credit Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  amount int not null,            -- credits added/deducted
  type text not null,             -- 'purchase', 'usage', 'bonus'
  description text,
  stripe_session_id text,
  created_at timestamptz default now()
);

-- API Usage Log (for tracking/debugging)
create table public.api_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  endpoint text not null,
  credits_used int not null,
  keywords_count int,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.keywords enable row level security;
alter table public.transactions enable row level security;
alter table public.api_usage enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can view own projects" on public.projects
  for all using (auth.uid() = user_id);

create policy "Users can manage own keywords" on public.keywords
  for all using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can view own usage" on public.api_usage
  for select using (auth.uid() = user_id);
```

## Credit System

### Pricing

| Package | Credits | Price | Per Keyword |
|---------|---------|-------|-------------|
| Starter | 500 | $9 | $0.018 |
| Growth | 1,500 | $19 | $0.013 |
| Pro | 5,000 | $49 | $0.010 |

### Credit Costs

| Action | Credits |
|--------|---------|
| Single keyword lookup (full data) | 1 |
| Bulk check (volume only, per keyword) | 0.2 |
| Suggestions/autocomplete | 0.5 |
| People Also Ask | 0.5 |

### Free Tier
- 50 credits on signup (no card required)
- Enough for ~50 keyword lookups
- Hooks users before asking for payment

## File Structure

```
keywordpeek/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/page.tsx      # Pricing page
│   │   └── layout.tsx            # Marketing layout
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Main dashboard
│   │   │   └── projects/
│   │   │       └── [id]/page.tsx # Project detail
│   │   ├── account/
│   │   │   └── page.tsx          # Account settings
│   │   └── layout.tsx            # App layout (sidebar)
│   ├── api/
│   │   ├── keywords/
│   │   │   ├── search/route.ts
│   │   │   ├── suggestions/route.ts
│   │   │   └── questions/route.ts
│   │   ├── projects/
│   │   │   └── route.ts
│   │   ├── credits/
│   │   │   └── purchase/route.ts
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts     # OAuth callback
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── keyword-search.tsx
│   ├── keyword-table.tsx
│   ├── credit-display.tsx
│   ├── project-selector.tsx
│   └── trend-sparkline.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── dataforseo/
│   │   ├── client.ts
│   │   ├── keywords.ts
│   │   └── types.ts
│   ├── stripe/
│   │   └── client.ts
│   └── utils.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example
├── middleware.ts
└── package.json
```

## Implementation Phases

### Phase 1: Core Tool (Week 1-2)

**Goal:** Working keyword research tool for internal use

#### 1.1 Project Setup
- [ ] Initialize Next.js 14 with App Router: `npx create-next-app@latest keywordpeek --typescript --tailwind --eslint --app --src-dir=false`
- [ ] Install dependencies:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install stripe @stripe/stripe-js
  npm install lucide-react
  npx shadcn@latest init
  npx shadcn@latest add button card input table badge dialog dropdown-menu
  ```
- [ ] Create Supabase project at supabase.com
- [ ] Setup `.env.local` with all environment variables
- [ ] Configure `next.config.js` for Cloudflare Pages compatibility

#### 1.2 DataForSEO Integration
- [ ] Create `lib/dataforseo/client.ts` - base HTTP client with auth
- [ ] Create `lib/dataforseo/keywords.ts` - keyword search functions
- [ ] Create `lib/dataforseo/types.ts` - TypeScript interfaces
- [ ] Implement keyword search: `POST /v3/keywords_data/google_ads/search_volume/live`
- [ ] Implement autocomplete: `POST /v3/keywords_data/google_ads/keywords_for_site/live`
- [ ] Implement suggestions: `POST /v3/keywords_data/google_ads/keywords_for_keywords/live`
- [ ] Implement PAA: `POST /v3/serp/google/organic/live/advanced` (extract PAA)
- [ ] Add response caching with Map or Redis to avoid duplicate API calls
- [ ] Add error handling and rate limit management

#### 1.3 Database Setup
- [ ] Run SQL schema in Supabase SQL editor
- [ ] Create `lib/supabase/client.ts` - browser client
- [ ] Create `lib/supabase/server.ts` - server client
- [ ] Create `middleware.ts` for auth session refresh
- [ ] Create database helper functions for common operations
- [ ] Test RLS policies work correctly

#### 1.4 Core UI Components
- [ ] Create `components/keyword-search.tsx` - search input with debounce
- [ ] Create `components/keyword-table.tsx` - results table with sorting
- [ ] Create `components/trend-sparkline.tsx` - 12-month trend visualization
- [ ] Create `components/project-selector.tsx` - dropdown to select/create projects
- [ ] Create `components/credit-display.tsx` - show remaining credits

#### 1.5 Dashboard Pages
- [ ] Create `app/(app)/layout.tsx` - sidebar with navigation
- [ ] Create `app/(app)/dashboard/page.tsx` - main search + results
- [ ] Create `app/(app)/dashboard/projects/page.tsx` - list all projects
- [ ] Create `app/(app)/dashboard/projects/[id]/page.tsx` - project detail with saved keywords
- [ ] Implement save keyword to project functionality
- [ ] Implement CSV export for keywords

#### 1.6 Auth Setup
- [ ] Create `app/auth/login/page.tsx` - email/password login
- [ ] Create `app/auth/signup/page.tsx` - registration with 50 free credits
- [ ] Create `app/auth/callback/route.ts` - OAuth callback handler
- [ ] Configure Supabase Auth providers (email + Google)
- [ ] Create auth middleware to protect `/dashboard` routes
- [ ] Create profile record on signup with 50 credits

### Phase 2: Monetization (Week 3-4)

**Goal:** Public launch with payments

#### 2.1 Stripe Setup
- [ ] Create Stripe account and get API keys
- [ ] Create 3 products in Stripe Dashboard:
  - Starter: $9 (500 credits)
  - Growth: $19 (1,500 credits)
  - Pro: $49 (5,000 credits)
- [ ] Create `lib/stripe/client.ts` - Stripe client setup
- [ ] Create `app/api/credits/purchase/route.ts` - create checkout session
- [ ] Create `app/api/webhooks/stripe/route.ts` - handle checkout.session.completed
- [ ] Implement credit addition on successful payment

#### 2.2 Credit System Implementation
- [ ] Create `lib/credits.ts` - credit check/deduct functions
- [ ] Add credit check middleware to keyword API routes
- [ ] Deduct credits on successful API calls
- [ ] Log all credit transactions
- [ ] Add "insufficient credits" error handling
- [ ] Show low balance warning in UI (< 10 credits)

#### 2.3 Landing Page
- [ ] Create `app/(marketing)/layout.tsx` - marketing header/footer
- [ ] Create `app/(marketing)/page.tsx` - landing page:
  - Hero: "Peek at your keywords. No subscription required."
  - How it works (3 steps)
  - Features grid
  - Pricing cards
  - FAQ accordion
  - CTA: "Start free - 50 keywords included"
- [ ] Create `app/(marketing)/pricing/page.tsx` - detailed pricing

#### 2.4 Account Management
- [ ] Create `app/(app)/account/page.tsx`:
  - Credit balance display
  - "Buy more credits" button → Stripe checkout
  - Transaction history table
  - Usage statistics (keywords searched, credits used)
- [ ] Create `app/api/account/transactions/route.ts` - fetch transaction history
- [ ] Create `app/api/account/usage/route.ts` - fetch usage stats

#### 2.5 Polish & Launch
- [ ] Add loading states (skeletons) for all async operations
- [ ] Add error boundaries and error states
- [ ] Mobile responsive design for all pages
- [ ] Add SEO meta tags and OpenGraph images
- [ ] Add favicon and app icons
- [ ] Setup analytics (Plausible or Umami)
- [ ] Create `wrangler.toml` for Cloudflare Pages
- [ ] Deploy to Cloudflare Pages
- [ ] Configure DNS for keywordpeek.com
- [ ] Test full flow: signup → search → save → purchase → search more

## API Route Implementations

### /api/keywords/search/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { searchKeywords } from '@/lib/dataforseo/keywords'
import { deductCredits, hasCredits } from '@/lib/credits'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { keywords } = await req.json() // string or string[]
  const keywordList = Array.isArray(keywords) ? keywords : [keywords]
  const creditsNeeded = keywordList.length

  if (!await hasCredits(user.id, creditsNeeded)) {
    return Response.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const results = await searchKeywords(keywordList)
  await deductCredits(user.id, creditsNeeded, 'Keyword search')

  return Response.json({ data: results })
}
```

### /api/webhooks/stripe/route.ts
```typescript
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const CREDIT_PACKAGES: Record<string, number> = {
  'price_starter': 500,
  'price_growth': 1500,
  'price_pro': 5000,
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const priceId = session.metadata?.price_id
    const credits = CREDIT_PACKAGES[priceId!] || 0

    const supabase = await createClient()

    // Add credits
    await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_amount: credits
    })

    // Log transaction
    await supabase.from('transactions').insert({
      user_id: userId,
      amount: credits,
      type: 'purchase',
      description: `Purchased ${credits} credits`,
      stripe_session_id: session.id
    })
  }

  return Response.json({ received: true })
}
```

## Environment Variables

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# DataForSEO
DATAFORSEO_LOGIN=your_login
DATAFORSEO_PASSWORD=your_password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=https://keywordpeek.com
```

## Design System

### Colors
```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --primary: #0a0a0a;
  --primary-foreground: #fafafa;
  --accent: #10b981;        /* Green for positive (low difficulty) */
  --destructive: #ef4444;   /* Red for high difficulty */
  --warning: #f59e0b;       /* Orange for medium */
}
```

### Typography
- Headings: Inter or system-ui, semi-bold
- Body: Inter or system-ui, regular
- Mono: JetBrains Mono (for data/numbers)

### Components Style
- Rounded corners (8px)
- Subtle shadows
- Clean borders (1px gray-200)
- Hover states with slight background change
- Focus rings for accessibility

## Verification Checklist

### Before Launch
- [ ] Search returns accurate DataForSEO data
- [ ] Credits deduct correctly on each search
- [ ] "Insufficient credits" shown when balance is 0
- [ ] Stripe checkout creates session successfully
- [ ] Webhook adds credits after payment
- [ ] Projects CRUD works correctly
- [ ] Save/delete keywords works
- [ ] CSV export includes all fields
- [ ] Auth flow works (signup, login, logout)
- [ ] New users get 50 free credits
- [ ] Mobile layout is usable
- [ ] All pages load under 3 seconds

### Test Stripe Flow
1. Use test card: 4242 4242 4242 4242
2. Complete checkout for each package
3. Verify credits added
4. Check transaction logged

## Integration with Other Projects

After KeywordPeek is live, any project can use it:

### Option 1: Dashboard (Manual)
Just log in to keywordpeek.com and research keywords manually.

### Option 2: API (Automated)
```typescript
// In any project's scripts
const KEYWORDPEEK_API = 'https://keywordpeek.com/api'
const API_KEY = process.env.KEYWORDPEEK_API_KEY

export async function researchKeyword(keyword: string) {
  const res = await fetch(`${KEYWORDPEEK_API}/keywords/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ keywords: [keyword] })
  })
  return res.json()
}
```

### For videoplayer.ad
Update `scripts/keyword-research.ts` to use KeywordPeek API instead of calling DataForSEO directly.

## Future Roadmap (Phase 3+)

- [ ] API access tier with API keys for developers
- [ ] Competitor domain analysis (what keywords they rank for)
- [ ] SERP tracking over time (rank monitoring)
- [ ] Chrome extension for quick lookups
- [ ] Keyword clustering (group by topic)
- [ ] Content brief generator
- [ ] Team/collaboration features
- [ ] Bulk upload CSV of keywords
- [ ] Keyword difficulty trend alerts
