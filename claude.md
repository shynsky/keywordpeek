# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:run -- tests/unit/lib/credits.test.ts  # Run single test file
```

## Deployment

- **Frontend**: Vercel connected to GitHub. Push to `main` to deploy.
- **Database**: Supabase. Run migrations manually via SQL Editor in dashboard.
- **Migrations**: Located in `supabase/migrations/`. Copy SQL to Supabase SQL Editor.

## Architecture

### Tech Stack
- Next.js 16 (App Router) + React 19
- Supabase (Postgres + Auth)
- Stripe (payments)
- DataForSEO Labs API (keyword data)
- Tailwind CSS 4 + shadcn/ui components

### Route Groups
- `app/(marketing)/` - Public landing page
- `app/(app)/` - Authenticated app (dashboard, account)
- `app/auth/` - Login, signup, OAuth callback
- `app/api/` - API routes

### Key Libraries

**`lib/dataforseo/`** - DataForSEO Labs API integration
- `client.ts` - HTTP client with auth, error handling
- `keywords.ts` - Search volume, related keywords, PAA questions
- Uses Labs API endpoints (cheaper than Google Ads API)

**`lib/credits.ts`** - Credit system
- RPC wrappers: `hasCredits()`, `getBalance()`, `deductCredits()`, `addCredits()`
- Pricing: 1 credit = 1 search (up to 10 keywords)
- Costs defined in `CREDIT_COSTS` constant

**`lib/stripe/client.ts`** - Stripe integration
- Credit packages: Starter (200/$9), Growth (500/$24), Pro (1600/$79)
- `createCheckoutSession()` for purchases

**`lib/supabase/`** - Supabase clients
- `client.ts` - Browser client
- `server.ts` - Server-side client (use in API routes/server components)
- `middleware.ts` - Auth session refresh

### Database Schema (Supabase)
- `profiles` - User data + credit balance
- `projects` - Keyword research workspaces
- `keywords` - Saved keywords with metrics
- `transactions` - Credit history (with `expires_at` for 1-year expiry)
- `keyword_cache` - API response cache

Credit operations use Supabase RPC functions (`add_credits`, `deduct_credits`, etc.) defined in migrations.

### API Routes Pattern
All keyword endpoints follow: check auth → calculate credits → verify balance → call DataForSEO → deduct credits → return data

### Environment Variables
```
DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
