# CLAUDE.md

## Reference Docs
See `.claude-docs/` for global setup guides (CC best practices, migration guide, project tracker).

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Info

| Service | Value |
|---------|-------|
| **GitHub** | [shynsky/keywordpeek](https://github.com/shynsky/keywordpeek) |
| **Domain** | keywordpeek.com |
| **Vercel** | project `keywordpeek` (team: mwmw, id: `prj_kQgrEMr47GawGKl1jqC573asZ563`) |
| **Supabase** | ref `olgscjrndwuqbjnpkejl` (Central EU / Frankfurt) |
| **Stripe** | Marek Wituszyński Media Works sandbox (test mode) |

## Commands

```bash
npm run dev           # Start development server (http://localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage report
npm run test:run -- tests/unit/lib/credits.test.ts  # Run single test file
```

## Deployment

- **Frontend**: Push to `main` on GitHub to deploy (Vercel auto-deploys from GitHub).
- **Database**: Supabase. Run migrations manually via SQL Editor in dashboard.
- **Migrations**: Located in `supabase/migrations/`. Copy SQL to Supabase SQL Editor.

### After Pushing to GitHub
Always check CI status after pushing:
```bash
gh run list --limit 3              # Check recent CI runs
gh run view <id> --log-failed      # Get failure details if any failed
```
If CI fails, investigate and fix the issues before moving on.

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
OPENAI_API_KEY
```

### Development User ID
Two environment variables for bypassing auth in development:
- `DEV_USER_ID` - Server-side (API routes, server components)
- `NEXT_PUBLIC_DEV_USER_ID` - Client-side (React components)

This split is intentional: server code uses the non-public version for security, while client components need the `NEXT_PUBLIC_` prefix to access the value.

**Note**: The dev server (`npm run dev`) requires all Supabase environment variables in `.env.local`. Without them, middleware fails with "Your project's URL and Key are required". Use `npm run build` to verify compilation without running the server.

### Supabase URL Configuration
- **Site URL**: `https://keywordpeek.com`
- **Redirect URLs**:
  - `https://keywordpeek.com/**`
  - `http://localhost:3000/**` (for local dev)
