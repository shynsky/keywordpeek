# KeywordPeek

Pay-as-you-go keyword research for bootstrappers. 80% of the value, 20% of the hassle.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Database & Auth:** Supabase (Postgres + Auth)
- **Payments:** Stripe
- **Keyword Data:** DataForSEO Labs API
- **Styling:** Tailwind CSS 4 + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Stripe account
- DataForSEO account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/keywordpeek.git
cd keywordpeek

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

See `.env.example` for all required variables:
- Supabase URL and keys
- DataForSEO credentials
- Stripe keys

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
```

## Pricing

| Package | Credits | Price |
|---------|---------|-------|
| Starter | 200     | $9    |
| Growth  | 500     | $24   |
| Pro     | 1,600   | $79   |

1 credit = 1 search (up to 10 keywords per search)

## Deployment

The app is deployed on **Vercel** with automatic deployments from the `main` branch.

- Push to `main` → automatic deploy
- Database migrations run manually via Supabase SQL Editor

## Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed development guide including:
- Architecture overview
- Database schema
- API routes
- Credit system details
