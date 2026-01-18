# Website Setup Blueprint for Claude Code

A comprehensive guide for recreating an automated blog system with Astro, Cloudflare Pages, and AI-powered content generation. This blueprint is designed to be adaptable to any niche with different topics, design themes, and information architecture.

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Astro Project Setup](#3-astro-project-setup)
4. [Tailwind & Design System](#4-tailwind--design-system)
5. [Site Configuration Pattern](#5-site-configuration-pattern)
6. [Content Collections](#6-content-collections)
7. [Layouts & Components](#7-layouts--components)
8. [Page Routing](#8-page-routing)
9. [SEO Implementation](#9-seo-implementation)
10. [Deployment (Cloudflare Pages)](#10-deployment-cloudflare-pages)
11. [Content Generation Pipeline](#11-content-generation-pipeline)
12. [Image Generation Pipeline](#12-image-generation-pipeline)
13. [Keyword Research System](#13-keyword-research-system)
14. [Deduplication System](#14-deduplication-system)
15. [Social Media Automation](#15-social-media-automation)
16. [GitHub Actions Workflows](#16-github-actions-workflows)
17. [Implementation Checklists](#17-implementation-checklists)
18. [Customization Guide](#18-customization-guide)
19. [Quick Reference](#19-quick-reference)

---

## 1. Overview & Architecture

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Astro 5.0 | Static site generation |
| Deployment | Cloudflare Pages | CDN hosting |
| Styling | Tailwind CSS + CSS Variables | Design system |
| Content | MDX + Zod | Validated content collections |
| Search | Pagefind | Client-side search |
| CI/CD | GitHub Actions | Automation workflows |
| Content AI | Claude API (Sonnet) | Article generation |
| Image AI | Fal.ai | Image generation |
| Keywords | DataForSEO | Keyword research |
| Dedup | OpenAI Embeddings | Semantic similarity |
| Social | Pinterest + Facebook APIs | Social posting |

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AUTOMATION PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │  DataForSEO  │───▶│   Keyword    │───▶│   Claude     │               │
│  │   (Weekly)   │    │    Queue     │    │    API       │               │
│  └──────────────┘    └──────────────┘    └──────┬───────┘               │
│                                                  │                       │
│                      ┌───────────────────────────┼───────────────┐      │
│                      │                           ▼               │      │
│                      │    ┌──────────────┐  ┌──────────┐        │      │
│                      │    │   OpenAI     │  │  Fal.ai  │        │      │
│                      │    │  Embeddings  │  │  Images  │        │      │
│                      │    └──────┬───────┘  └────┬─────┘        │      │
│                      │           │               │               │      │
│                      │           ▼               ▼               │      │
│                      │    ┌──────────────────────────────┐      │      │
│                      │    │         MDX Content          │      │      │
│                      │    │    + WebP Images + Queue     │      │      │
│                      │    └──────────────┬───────────────┘      │      │
│                      │                   │                       │      │
│                      └───────────────────┼───────────────────────┘      │
│                                          ▼                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │    Git       │───▶│    Astro     │───▶│  Cloudflare  │               │
│  │   Commit     │    │    Build     │    │    Pages     │               │
│  └──────────────┘    └──────────────┘    └──────┬───────┘               │
│                                                  │                       │
│                                                  ▼                       │
│                                          ┌──────────────┐               │
│                                          │   Social     │               │
│                                          │   Posting    │               │
│                                          └──────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

SCHEDULE:
• Keyword Research: Weekly (Sundays 6 AM UTC)
• Article Generation: 2×/day (7:15 AM + 7:15 PM UTC)
• Deployment: On push to main
```

### Cost Breakdown

| Component | Cost per Article | Weekly (14 articles) | Monthly |
|-----------|------------------|----------------------|---------|
| Claude API | $0.15-0.30 | $2.10-4.20 | $9-18 |
| Fal.ai Infographic | $0.15 | $2.10 | $9 |
| Fal.ai Fill Images (3×) | $0.18 | $2.52 | $11 |
| OpenAI Embeddings | ~$0.00001 | ~$0.0001 | ~$0.001 |
| DataForSEO | $0.001/keyword | ~$0.10 | ~$0.40 |
| **Total** | **$0.48-0.63** | **$6.70-8.80** | **$29-38** |

**Free Tier Usage:**
- Cloudflare Pages: Free (500 builds/month)
- GitHub Actions: Free (2,000 minutes/month)

### Business Model

**Revenue Strategy:** Display advertising (AdSense → Mediavine)
- Target: 50,000+ sessions/month for Mediavine eligibility
- Timeline: 6-12 months of consistent publishing
- Secondary: Affiliate links, sponsored content

---

## 2. Prerequisites & Environment Setup

### Required Accounts

| Service | Purpose | Cost | Sign-up URL |
|---------|---------|------|-------------|
| GitHub | Code hosting & CI/CD | Free | github.com |
| Cloudflare | Hosting & CDN | Free | cloudflare.com |
| Anthropic | Claude API | Pay-per-use | console.anthropic.com |
| Fal.ai | Image generation | Pay-per-use | fal.ai |
| DataForSEO | Keyword research | Pay-per-use | dataforseo.com |
| OpenAI | Embeddings (optional) | Pay-per-use | platform.openai.com |
| Pinterest | Social posting (optional) | Free | developers.pinterest.com |
| Facebook | Social posting (optional) | Free | developers.facebook.com |

### Environment Variables

Create `.env` file (never commit to git):

```bash
# Required: Content Generation
ANTHROPIC_API_KEY=sk-ant-api03-...

# Required: Image Generation
FAL_KEY=...

# Required: Deployment (set in GitHub Secrets)
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...

# Required: Keyword Research
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_password

# Optional: Deduplication (graceful degradation without)
OPENAI_API_KEY=sk-...

# Optional: Analytics
PUBLIC_GA4_ID=G-XXXXXXXXXX

# Optional: Social Media
PINTEREST_ACCESS_TOKEN=pina_...
PINTEREST_BOARD_ID=...
FACEBOOK_PAGE_ID=...
FACEBOOK_ACCESS_TOKEN=...

# Optional: Newsletter
BUTTONDOWN_API_KEY=...
BUTTONDOWN_USERNAME=your_newsletter
```

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/your-username/your-blog.git
cd your-blog

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev

# Open http://localhost:4321
```

---

## 3. Astro Project Setup

### Project Initialization

```bash
# Create new Astro project
npm create astro@latest your-blog

# Select options:
# - Empty template
# - TypeScript: Strict
# - Install dependencies: Yes

# Add integrations
npx astro add tailwind
npx astro add mdx
npx astro add sitemap
npm install @astrojs/rss
npm install sharp  # Image processing
```

### astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { SITE_CONFIG } from './src/site-config';

export default defineConfig({
  site: SITE_CONFIG.url,
  integrations: [
    sitemap(),
    mdx(),
    tailwind()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light'  // Or 'github-dark' for dark theme
    }
  }
});
```

### tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### package.json

```json
{
  "name": "your-blog",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && npx pagefind --site dist",
    "build:noindex": "astro build",
    "preview": "astro preview",
    "research": "tsx scripts/initial-research.ts",
    "generate": "tsx scripts/generate-article.ts",
    "social": "tsx scripts/post-social.ts"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/rss": "^4.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "@astrojs/tailwind": "^6.0.0",
    "sharp": "^0.34.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@anthropic-ai/sdk": "^0.32.0",
    "@fal-ai/client": "^1.0.0",
    "dotenv": "^16.3.0",
    "glob": "^11.0.0",
    "openai": "^4.0.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

### Directory Structure

```
your-blog/
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ArticleCard.astro
│   │   ├── Breadcrumbs.astro
│   │   ├── TableOfContents.astro
│   │   ├── FAQ.astro
│   │   ├── RelatedArticles.astro
│   │   ├── SocialShare.astro
│   │   ├── PromoBlock.astro
│   │   └── SEO/
│   │       ├── ArticleSchema.astro
│   │       ├── FAQSchema.astro
│   │       ├── BreadcrumbSchema.astro
│   │       ├── OrganizationSchema.astro
│   │       ├── WebSiteSchema.astro
│   │       └── CollectionPageSchema.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ArticleLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── [category]/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── topics/
│   │   │   └── [topic].astro
│   │   └── rss.xml.ts
│   ├── content/
│   │   ├── config.ts
│   │   ├── category-1/
│   │   ├── category-2/
│   │   └── category-3/
│   ├── styles/
│   │   └── global.css
│   ├── site-config.ts
│   └── types.ts
├── scripts/
│   ├── generate-article.ts
│   ├── initial-research.ts
│   ├── embeddings.ts
│   ├── build-embedding-cache.ts
│   ├── post-social.ts
│   ├── keyword-queue.json
│   ├── keyword-research-results.json
│   └── embeddings-cache.json
├── public/
│   ├── images/
│   ├── logo.svg
│   ├── favicon.svg
│   ├── robots.txt
│   └── llms.txt
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       ├── keyword-research.yml
│       └── publish-article.yml
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
├── .env.example
└── .gitignore
```

---

## 4. Tailwind & Design System

### tailwind.config.mjs

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Map to CSS custom properties for easy theming
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'text-inverse': 'var(--color-text-inverse)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-light': 'var(--color-accent-light)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        'footer-bg': 'var(--color-footer-bg)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        handwritten: 'var(--font-handwritten)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
        '6xl': 'var(--text-6xl)',
        '7xl': 'var(--text-7xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        'card-hover': 'var(--shadow-card-hover)',
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
        lg: 'var(--border-radius-lg)',
        xl: 'var(--border-radius-xl)',
      },
      transitionTimingFunction: {
        'out-expo': 'var(--ease-out-expo)',
        'out-back': 'var(--ease-out-back)',
        smooth: 'var(--ease-smooth)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s var(--ease-out-expo) forwards',
        'fade-in': 'fade-in 0.4s var(--ease-out-expo) forwards',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
```

### CSS Custom Properties (global.css)

```css
/* src/styles/global.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* ===== COLOR SYSTEM ===== */

  /* Backgrounds */
  --color-background: #FDF6E3;       /* Main page background */
  --color-surface: #FAF0DC;          /* Card surfaces */
  --color-surface-elevated: #FFF9ED; /* Elevated elements */

  /* Text */
  --color-text: #3D2914;             /* Primary text */
  --color-text-muted: #7A6550;       /* Secondary text */
  --color-text-inverse: #FDF6E3;     /* Text on dark backgrounds */

  /* Accents */
  --color-accent: #C1440E;           /* Primary accent (brand color) */
  --color-accent-hover: #A33A0C;     /* Accent hover state */
  --color-accent-light: #E8820C;     /* Secondary accent */
  --color-accent-light-hover: #D0740A;

  /* Borders */
  --color-border: #D9CBAF;           /* Standard borders */
  --color-border-strong: #BFA67A;    /* Emphasized borders */
  --color-border-accent: #C1440E;    /* Accent borders */

  /* Special surfaces */
  --color-footer-bg: #3D2914;        /* Footer background */

  /* ===== TYPOGRAPHY ===== */

  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Lora', Georgia, serif;
  --font-handwritten: 'Caveat', cursive;
  --font-mono: 'JetBrains Mono', monospace;

  /* Type scale (1.25 ratio) */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;
  --text-7xl: 4.5rem;

  /* ===== SHADOWS ===== */

  --shadow-sm: 0 2px 4px rgba(61, 41, 20, 0.08);
  --shadow-md: 0 4px 12px rgba(61, 41, 20, 0.12);
  --shadow-lg: 0 8px 24px rgba(61, 41, 20, 0.16);
  --shadow-xl: 0 12px 32px rgba(61, 41, 20, 0.2);
  --shadow-card-hover: 0 16px 40px rgba(61, 41, 20, 0.18);

  /* ===== SPACING ===== */

  --border-radius: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;

  /* ===== ANIMATION ===== */

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.65, 0, 0.35, 1);

  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}

/* ===== BASE STYLES ===== */

html {
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Selection color */
::selection {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ===== CONTAINER ===== */

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}

/* ===== ANIMATION DELAYS ===== */

.delay-1 { animation-delay: 100ms; }
.delay-2 { animation-delay: 200ms; }
.delay-3 { animation-delay: 300ms; }
.delay-4 { animation-delay: 400ms; }
.delay-5 { animation-delay: 500ms; }

/* ===== PRINT STYLES ===== */

@media print {
  header, footer, nav, .sidebar, .social-share,
  .related-articles, .faq-section, .newsletter-form,
  [data-no-print] {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
    font-size: 12pt;
  }

  * {
    transform: none !important;
    animation: none !important;
    box-shadow: none !important;
  }

  /* Checkboxes for lists */
  .article-content ul li::before {
    content: "☐" !important;
  }

  /* Show URLs for external links */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 9pt;
    color: #666;
  }
}
```

### Theme Customization Examples

**Tech Blog (Dark Theme):**
```css
:root {
  --color-background: #0F172A;
  --color-surface: #1E293B;
  --color-text: #E2E8F0;
  --color-accent: #3B82F6;
  --font-display: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

**Lifestyle Blog (Soft Theme):**
```css
:root {
  --color-background: #FDF8F6;
  --color-surface: #FFFFFF;
  --color-text: #292524;
  --color-accent: #DB2777;
  --font-display: 'Playfair Display', serif;
  --font-body: 'Source Sans Pro', sans-serif;
}
```

**Finance Blog (Professional Theme):**
```css
:root {
  --color-background: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-text: #1E293B;
  --color-accent: #059669;
  --font-display: 'Merriweather', serif;
  --font-body: 'Open Sans', sans-serif;
}
```

---

## 5. Site Configuration Pattern

### site-config.ts Structure

```typescript
// src/site-config.ts

export interface CategoryConfig {
  name: string;
  description: string;
  volume?: number;  // DataForSEO search volume (optional)
  icon?: string;    // Emoji or icon class
}

export interface ThemeConfig {
  style: string;
  colors: {
    accent: string;
    accentLight: string;
    background: string;
    text: string;
    footerBg: string;
  };
  fonts: {
    display: string;
    body: string;
    handwritten?: string;
    mono?: string;
  };
  borderRadius: number;
  shadows: boolean;
}

export interface ContentPromptConfig {
  audience: string;
  tone: string;
  wordCount: { min: number; max: number };
  specialInstructions?: string;
}

export interface NewsletterConfig {
  enabled: boolean;
  provider: 'buttondown' | 'mailchimp' | 'convertkit';
  endpoint: string;
}

export interface NetworkSite {
  name: string;
  url: string;
  topics: string[];
  anchor: string;
}

export interface SiteConfig {
  // Identity
  name: string;
  tagline: string;
  url: string;
  language: string;
  locale: string;
  email: string;
  logo: string;

  // Content structure
  categories: Record<string, CategoryConfig>;
  topics: readonly string[];

  // Design
  theme: ThemeConfig;

  // AI Content
  contentPrompt: ContentPromptConfig;

  // Features
  newsletter: NewsletterConfig;
  promo: {
    enabled: boolean;
    headline: string;
    description: string;
    link: string;
  };

  // SEO
  networkSites: NetworkSite[];
}

export const SITE_CONFIG: SiteConfig = {
  // ===== IDENTITY =====
  name: 'Your Blog Name',
  tagline: 'Your catchy tagline here',
  url: 'https://yourdomain.com',
  language: 'en',
  locale: 'en_US',
  email: 'contact@yourdomain.com',
  logo: '/logo.svg',

  // ===== CATEGORIES =====
  // Define 3-5 main content categories
  categories: {
    'category-1': {
      name: 'Category One',
      description: 'Description for category one',
      volume: 100000,  // Optional: from DataForSEO
      icon: '📚'
    },
    'category-2': {
      name: 'Category Two',
      description: 'Description for category two',
      volume: 80000,
      icon: '⚡'
    },
    'category-3': {
      name: 'Category Three',
      description: 'Description for category three',
      volume: 60000,
      icon: '🎯'
    },
  },

  // ===== TOPICS =====
  // 15-25 curated topics for internal linking
  topics: [
    'topic-1', 'topic-2', 'topic-3', 'topic-4', 'topic-5',
    'topic-6', 'topic-7', 'topic-8', 'topic-9', 'topic-10',
    'topic-11', 'topic-12', 'topic-13', 'topic-14', 'topic-15',
  ] as const,

  // ===== THEME =====
  theme: {
    style: 'your-theme-name',
    colors: {
      accent: '#C1440E',       // Primary brand color
      accentLight: '#E8820C',  // Secondary accent
      background: '#FDF6E3',   // Page background
      text: '#3D2914',         // Main text color
      footerBg: '#3D2914',     // Footer background
    },
    fonts: {
      display: 'Fraunces',
      body: 'Lora',
      handwritten: 'Caveat',
      mono: 'JetBrains Mono',
    },
    borderRadius: 8,
    shadows: true,
  },

  // ===== CONTENT GENERATION =====
  contentPrompt: {
    audience: 'Describe your target audience here',
    tone: 'Describe the writing tone and style',
    wordCount: { min: 1200, max: 2000 },
    specialInstructions: `
      Additional instructions for Claude:
      - Use specific formatting patterns
      - Include certain sections
      - Avoid certain topics
      - Structure requirements
    `,
  },

  // ===== NEWSLETTER =====
  newsletter: {
    enabled: true,
    provider: 'buttondown',
    endpoint: 'your-newsletter-username',
  },

  // ===== PROMO =====
  promo: {
    enabled: true,
    headline: 'Join Our Community',
    description: 'Get exclusive content delivered to your inbox.',
    link: '/newsletter',
  },

  // ===== NETWORK SITES =====
  // For cross-linking in blog networks
  networkSites: [
    {
      name: 'Related Site',
      url: 'https://relatedsite.com',
      topics: ['topic-1', 'topic-2'],
      anchor: 'description for link anchor text',
    },
  ],
};
```

---

## 6. Content Collections

### Content Schema (config.ts)

```typescript
// src/content/config.ts

import { z, defineCollection } from 'astro:content';

// FAQ schema (reusable)
const faqSchema = z.object({
  question: z.string().min(10, 'Question too short'),
  answer: z.string().min(20, 'Answer too short'),
});

// Base article schema
const articleSchema = z.object({
  // Required fields
  title: z.string()
    .min(10, 'Title too short for SEO')
    .max(100, 'Title will be truncated'),
  description: z.string()
    .min(50, 'Description too short for SEO')
    .max(160, 'Description exceeds meta limit'),
  publishedAt: z.coerce.date(),

  // Optional but recommended
  updatedAt: z.coerce.date().optional(),
  image: z.string().optional(),
  topics: z.array(z.string()).min(3).max(7).default([]),
  faqs: z.array(faqSchema).optional(),

  // Control flags
  draft: z.boolean().default(false),
  noindex: z.boolean().default(false),
});

// Niche-specific extensions
// Example: Recipe site
const recipeSchema = articleSchema.extend({
  difficulty: z.enum(['easy', 'medium', 'hard']).default('easy'),
  prepTime: z.string().optional(),    // "20 minutes"
  cookTime: z.string().optional(),    // "30 minutes"
  servings: z.string().optional(),    // "4 servings"
});

// Example: Tech blog
const techSchema = articleSchema.extend({
  techStack: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  codeLanguage: z.string().optional(),
});

// Example: Product reviews
const reviewSchema = articleSchema.extend({
  rating: z.number().min(1).max(5).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  price: z.string().optional(),
});

// Define collections
export const collections = {
  'category-1': defineCollection({ schema: articleSchema }),
  'category-2': defineCollection({ schema: articleSchema }),
  'category-3': defineCollection({ schema: articleSchema }),
};
```

### MDX Frontmatter Example

```mdx
---
title: "Your Article Title Here (50-60 characters ideal)"
description: "Meta description that appears in search results (150-160 characters)."
publishedAt: 2024-01-15
updatedAt: 2024-01-20
image: /images/article-slug.webp
topics:
  - topic-1
  - topic-2
  - topic-3
faqs:
  - question: "First frequently asked question?"
    answer: "Comprehensive answer to the first question in 2-4 sentences."
  - question: "Second frequently asked question?"
    answer: "Comprehensive answer to the second question in 2-4 sentences."
---

## Introduction

Your article content starts here...

## Main Section

Content for main section...

## Another Section

More content...

## Frequently Asked Questions

FAQ content rendered automatically from frontmatter...
```

---

## 7. Layouts & Components

### BaseLayout.astro

```astro
---
// src/layouts/BaseLayout.astro

import { SITE_CONFIG } from '../site-config';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  image?: string;
  article?: {
    publishedAt: Date;
    updatedAt?: Date;
    section?: string;
    tags?: string[];
  };
  noindex?: boolean;
}

const {
  title,
  description,
  image = '/og-default.jpg',
  article,
  noindex = false,
} = Astro.props;

const canonicalUrl = new URL(Astro.url.pathname, SITE_CONFIG.url);
const ogImage = new URL(image, SITE_CONFIG.url);
const pageTitle = `${title} | ${SITE_CONFIG.name}`;

const ga4Id = import.meta.env.PUBLIC_GA4_ID;
---

<!DOCTYPE html>
<html lang={SITE_CONFIG.language}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Primary Meta Tags -->
  <title>{pageTitle}</title>
  <meta name="title" content={pageTitle} />
  <meta name="description" content={description} />
  <meta name="author" content={SITE_CONFIG.name} />
  <link rel="canonical" href={canonicalUrl} />

  <!-- Robots -->
  {noindex ? (
    <meta name="robots" content="noindex, nofollow" />
  ) : (
    <meta name="robots" content="max-image-preview:large" />
  )}

  <!-- Open Graph -->
  <meta property="og:type" content={article ? 'article' : 'website'} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content={SITE_CONFIG.locale} />
  <meta property="og:site_name" content={SITE_CONFIG.name} />

  <!-- Article Meta -->
  {article && (
    <>
      <meta property="article:published_time" content={article.publishedAt.toISOString()} />
      {article.updatedAt && (
        <meta property="article:modified_time" content={article.updatedAt.toISOString()} />
      )}
      {article.section && (
        <meta property="article:section" content={article.section} />
      )}
      {article.tags?.map(tag => (
        <meta property="article:tag" content={tag} />
      ))}
    </>
  )}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={canonicalUrl} />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

  <!-- RSS & Sitemap -->
  <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
  <link rel="sitemap" type="application/xml" href="/sitemap-index.xml" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Your+Fonts+Here&display=swap" />

  <!-- Schema slot for page-specific JSON-LD -->
  <slot name="head" />

  <!-- Google Analytics -->
  {ga4Id && (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}></script>
      <script is:inline define:vars={{ ga4Id }}>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', ga4Id);
      </script>
    </>
  )}
</head>
<body>
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</body>
</html>
```

### ArticleLayout.astro (Simplified)

```astro
---
// src/layouts/ArticleLayout.astro

import BaseLayout from './BaseLayout.astro';
import Breadcrumbs from '../components/Breadcrumbs.astro';
import TableOfContents from '../components/TableOfContents.astro';
import FAQ from '../components/FAQ.astro';
import RelatedArticles from '../components/RelatedArticles.astro';
import SocialShare from '../components/SocialShare.astro';

// SEO Schemas
import ArticleSchema from '../components/SEO/ArticleSchema.astro';
import FAQSchema from '../components/SEO/FAQSchema.astro';
import BreadcrumbSchema from '../components/SEO/BreadcrumbSchema.astro';

import { SITE_CONFIG } from '../site-config';

interface Props {
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  image?: string;
  topics: string[];
  faqs?: Array<{ question: string; answer: string }>;
  category: string;
  slug: string;
  headings: Array<{ depth: number; slug: string; text: string }>;
}

const {
  title,
  description,
  publishedAt,
  updatedAt,
  image,
  topics,
  faqs,
  category,
  slug,
  headings,
} = Astro.props;

const categoryInfo = SITE_CONFIG.categories[category];
const canonicalUrl = new URL(`/${category}/${slug}`, SITE_CONFIG.url).href;

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: categoryInfo.name, href: `/${category}` },
  { name: title },
];
---

<BaseLayout
  title={title}
  description={description}
  image={image}
  article={{
    publishedAt,
    updatedAt,
    section: categoryInfo.name,
    tags: topics,
  }}
>
  <!-- JSON-LD Schemas -->
  <Fragment slot="head">
    <ArticleSchema
      title={title}
      description={description}
      publishedAt={publishedAt}
      updatedAt={updatedAt}
      image={image}
      url={canonicalUrl}
      category={category}
    />
    {faqs?.length && <FAQSchema faqs={faqs} />}
    <BreadcrumbSchema items={breadcrumbs} />
  </Fragment>

  <div class="container py-8">
    <Breadcrumbs items={breadcrumbs} />

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mt-8">
      <!-- Main Content -->
      <article>
        <header class="mb-8">
          <h1 class="text-4xl font-display font-bold mb-4">{title}</h1>
          <p class="text-lg text-text-muted">{description}</p>
          <div class="mt-4 text-sm text-text-muted">
            Published: {publishedAt.toLocaleDateString()}
            {updatedAt && ` • Updated: ${updatedAt.toLocaleDateString()}`}
          </div>
        </header>

        {image && (
          <img
            src={image}
            alt={title}
            width="1280"
            height="720"
            class="rounded-lg mb-8"
            loading="eager"
            fetchpriority="high"
          />
        )}

        <div class="article-content prose prose-lg max-w-none">
          <slot />
        </div>

        {faqs?.length && <FAQ faqs={faqs} />}

        <SocialShare url={canonicalUrl} title={title} />

        <!-- Topics -->
        <div class="mt-8 flex flex-wrap gap-2">
          {topics.map(topic => (
            <a
              href={`/topics/${topic}`}
              class="px-3 py-1 bg-surface rounded-full text-sm hover:bg-accent hover:text-text-inverse transition"
            >
              {topic}
            </a>
          ))}
        </div>
      </article>

      <!-- Sidebar -->
      <aside class="hidden lg:block">
        {headings.length > 2 && (
          <TableOfContents headings={headings} />
        )}
      </aside>
    </div>

    <RelatedArticles
      currentSlug={slug}
      currentCategory={category}
      currentTopics={topics}
    />
  </div>
</BaseLayout>
```

### Core Components List

| Component | Purpose |
|-----------|---------|
| `Header.astro` | Site header with navigation |
| `Footer.astro` | Site footer with links |
| `Breadcrumbs.astro` | Navigation breadcrumbs |
| `ArticleCard.astro` | Card for article listings |
| `TableOfContents.astro` | Sticky TOC for articles |
| `FAQ.astro` | Expandable FAQ section |
| `RelatedArticles.astro` | Related content recommendations |
| `SocialShare.astro` | Social sharing buttons |
| `PromoBlock.astro` | Newsletter/CTA block |
| `SearchBar.astro` | Pagefind search interface |

### SEO Schema Components

| Component | Schema Type |
|-----------|-------------|
| `ArticleSchema.astro` | Article JSON-LD |
| `FAQSchema.astro` | FAQPage JSON-LD |
| `BreadcrumbSchema.astro` | BreadcrumbList JSON-LD |
| `OrganizationSchema.astro` | Organization JSON-LD |
| `WebSiteSchema.astro` | WebSite JSON-LD |
| `CollectionPageSchema.astro` | CollectionPage JSON-LD |

---

## 8. Page Routing

### Static Pages

```
src/pages/
├── index.astro           → /
├── search.astro          → /search
├── about.astro           → /about (optional)
└── rss.xml.ts            → /rss.xml
```

### Dynamic Routes

```
src/pages/
├── [category]/
│   ├── index.astro       → /category-1, /category-2, etc.
│   └── [...slug].astro   → /category-1/article-slug
└── topics/
    └── [topic].astro     → /topics/topic-name
```

### Category Index Page

```astro
---
// src/pages/[category]/index.astro

import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ArticleCard from '../../components/ArticleCard.astro';
import { SITE_CONFIG } from '../../site-config';

export async function getStaticPaths() {
  return Object.keys(SITE_CONFIG.categories).map(category => ({
    params: { category },
  }));
}

const { category } = Astro.params;
const categoryInfo = SITE_CONFIG.categories[category];

const articles = await getCollection(category);
const sortedArticles = articles
  .filter(a => !a.data.draft)
  .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
---

<BaseLayout title={categoryInfo.name} description={categoryInfo.description}>
  <div class="container py-8">
    <h1 class="text-4xl font-display font-bold mb-4">{categoryInfo.name}</h1>
    <p class="text-lg text-text-muted mb-8">{categoryInfo.description}</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedArticles.map(article => (
        <ArticleCard
          title={article.data.title}
          description={article.data.description}
          href={`/${category}/${article.slug}`}
          image={article.data.image}
          publishedAt={article.data.publishedAt}
        />
      ))}
    </div>
  </div>
</BaseLayout>
```

### Article Detail Page

```astro
---
// src/pages/[category]/[...slug].astro

import { getCollection } from 'astro:content';
import ArticleLayout from '../../layouts/ArticleLayout.astro';
import { SITE_CONFIG } from '../../site-config';

export async function getStaticPaths() {
  const allArticles = await Promise.all(
    Object.keys(SITE_CONFIG.categories).map(async category => {
      const articles = await getCollection(category);
      return articles.map(article => ({
        params: { category, slug: article.slug },
        props: { article, category },
      }));
    })
  );
  return allArticles.flat();
}

const { article, category } = Astro.props;
const { Content, headings } = await article.render();
---

<ArticleLayout
  title={article.data.title}
  description={article.data.description}
  publishedAt={article.data.publishedAt}
  updatedAt={article.data.updatedAt}
  image={article.data.image}
  topics={article.data.topics}
  faqs={article.data.faqs}
  category={category}
  slug={article.slug}
  headings={headings}
>
  <Content />
</ArticleLayout>
```

### RSS Feed

```typescript
// src/pages/rss.xml.ts

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_CONFIG } from '../site-config';

export async function GET(context) {
  const allArticles = await Promise.all(
    Object.keys(SITE_CONFIG.categories).map(category =>
      getCollection(category)
    )
  );

  const articles = allArticles
    .flat()
    .filter(a => !a.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  return rss({
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.tagline,
    site: context.site,
    customData: `<language>${SITE_CONFIG.language}</language>`,
    items: articles.map(article => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: `/${article.collection}/${article.slug}/`,
      categories: [article.collection, ...(article.data.topics || [])],
    })),
  });
}
```

---

## 9. SEO Implementation

### Meta Tags Pattern

See BaseLayout.astro above for complete implementation.

**Key meta tags:**
- Primary: title, description, canonical
- Open Graph: og:type, og:url, og:title, og:description, og:image
- Twitter: twitter:card, twitter:title, twitter:description, twitter:image
- Article: article:published_time, article:modified_time, article:section, article:tag
- Robots: max-image-preview:large (for Google Discover)

### JSON-LD Schema Components

**ArticleSchema.astro:**
```astro
---
import { SITE_CONFIG } from '../../site-config';

interface Props {
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  image?: string;
  url: string;
  category: string;
}

const { title, description, publishedAt, updatedAt, image, url, category } = Astro.props;

const schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "datePublished": publishedAt.toISOString(),
  "dateModified": (updatedAt || publishedAt).toISOString(),
  "image": image ? new URL(image, SITE_CONFIG.url).href : undefined,
  "author": {
    "@type": "Organization",
    "name": SITE_CONFIG.name,
    "url": SITE_CONFIG.url
  },
  "publisher": {
    "@type": "Organization",
    "name": SITE_CONFIG.name,
    "url": SITE_CONFIG.url,
    "logo": {
      "@type": "ImageObject",
      "url": new URL(SITE_CONFIG.logo, SITE_CONFIG.url).href
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": url
  },
  "inLanguage": SITE_CONFIG.language
};
---

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

### robots.txt

```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap-index.xml
```

### llms.txt

```
# Your Blog Name

[One paragraph describing your site's purpose, target audience, and content focus.]

## Content Categories

- **Category 1**: Description of what this category covers
- **Category 2**: Description of what this category covers
- **Category 3**: Description of what this category covers

## Main Topics

topic1, topic2, topic3, topic4, topic5, topic6, topic7, topic8, topic9, topic10

## Quality & Freshness

- Frequency: [How often content is published]
- Sources: [How content is researched/validated]
- Verification: [Quality assurance process]

## Target Audience

[Detailed description of who the content is for]

## About

[Brief background for authority/credibility]
```

---

## 10. Deployment (Cloudflare Pages)

### GitHub Integration Setup

1. Push your repository to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:

| Setting | Value |
|---------|-------|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (or your project root) |
| Node.js version | 20 |

### Environment Variables in Cloudflare

Add these in Cloudflare Pages → Settings → Environment variables:

```
PUBLIC_GA4_ID=G-XXXXXXXXXX
```

Note: Build-time secrets (like API keys) should be set in GitHub Secrets, not Cloudflare, as the build happens in GitHub Actions.

### Custom Domain Setup

1. Go to Cloudflare Pages → Your project → Custom domains
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions
5. Enable "Always use HTTPS"

### Deployment via GitHub Actions

See Section 16 for the complete workflow configuration.

---

## 11. Content Generation Pipeline

### generate-article.ts Architecture

```typescript
// scripts/generate-article.ts

import Anthropic from '@anthropic-ai/sdk';
import * as fal from '@fal-ai/client';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

import { SITE_CONFIG } from '../src/site-config';
import { checkExactSlugMatch, findSimilar, saveEmbeddingCache } from './embeddings';

// ===== TYPES =====

interface KeywordQueueItem {
  keyword: string;
  volume: number;
  competition: string;
  score: number;
  status: 'pending' | 'generated' | 'duplicate' | 'published';
  duplicateOf?: string;
  category?: string;
}

interface GeneratedArticle {
  title: string;
  description: string;
  category: string;
  content: string;
  faqs: Array<{ question: string; answer: string }>;
  imageData: {
    infographic: string;
    fill: string[];
  };
  topics: string[];
}

// ===== CONFIGURATION =====

const QUEUE_PATH = 'scripts/keyword-queue.json';
const LAST_ARTICLE_PATH = 'scripts/last-article.json';

// ===== MAIN FUNCTION =====

async function main() {
  console.log('Starting article generation...');

  // 1. Load keyword queue
  const queue: KeywordQueueItem[] = JSON.parse(
    fs.readFileSync(QUEUE_PATH, 'utf-8')
  );

  // 2. Find next pending keyword
  const pending = queue.find(k => k.status === 'pending');
  if (!pending) {
    console.log('No pending keywords in queue.');
    return;
  }

  console.log(`Processing keyword: ${pending.keyword}`);
  const slug = slugify(pending.keyword);

  // 3. Check for exact slug match (fast, no API)
  const existingPath = checkExactSlugMatch(slug);
  if (existingPath) {
    console.log(`Exact match found: ${existingPath}`);
    pending.status = 'duplicate';
    pending.duplicateOf = existingPath;
    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
    return;
  }

  // 4. Check for semantic duplicate (embedding-based)
  const similar = await findSimilar(pending.keyword, 0.85);
  if (similar) {
    console.log(`Semantic duplicate found: ${similar.slug} (${similar.similarity.toFixed(2)})`);
    pending.status = 'duplicate';
    pending.duplicateOf = similar.slug;
    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
    return;
  }

  // 5. Generate article with Claude
  const article = await generateArticle(pending.keyword);

  // 6. Generate images with Fal.ai
  const images = await generateImages(article, slug);

  // 7. Write MDX file
  const mdxPath = writeMdxFile(article, slug, images);
  console.log(`Created: ${mdxPath}`);

  // 8. Update queue status
  pending.status = 'generated';
  pending.category = article.category;
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));

  // 9. Save for social posting
  fs.writeFileSync(LAST_ARTICLE_PATH, JSON.stringify({
    slug,
    title: article.title,
    description: article.description,
    category: article.category,
    url: `${SITE_CONFIG.url}/${article.category}/${slug}`,
    images,
    topics: article.topics,
  }, null, 2));

  // 10. Update embedding cache
  await saveEmbeddingCache(slug, article.title, article.description);

  console.log('Article generation complete!');
}

// ===== CLAUDE API =====

async function generateArticle(keyword: string): Promise<GeneratedArticle> {
  const anthropic = new Anthropic();

  const prompt = buildPrompt(keyword);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Parse JSON response
  const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from response');
  }

  return JSON.parse(jsonMatch[1]);
}

function buildPrompt(keyword: string): string {
  const categories = Object.entries(SITE_CONFIG.categories)
    .map(([slug, info]) => `- ${slug}: ${info.description}`)
    .join('\n');

  const topics = SITE_CONFIG.topics.join(', ');

  return `You are a content writer for ${SITE_CONFIG.name}.

Target audience: ${SITE_CONFIG.contentPrompt.audience}
Writing tone: ${SITE_CONFIG.contentPrompt.tone}

Write a comprehensive article about: "${keyword}"

${SITE_CONFIG.contentPrompt.specialInstructions || ''}

CATEGORIES (choose one):
${categories}

AVAILABLE TOPICS (choose 3-7):
${topics}

Respond with JSON in this exact format:
\`\`\`json
{
  "title": "SEO-optimized title (50-60 characters)",
  "description": "Meta description (150-160 characters)",
  "category": "category-slug",
  "content": "Full markdown article (${SITE_CONFIG.contentPrompt.wordCount.min}-${SITE_CONFIG.contentPrompt.wordCount.max} words)",
  "faqs": [
    { "question": "Question 1?", "answer": "Answer 1" },
    { "question": "Question 2?", "answer": "Answer 2" }
  ],
  "imageData": {
    "infographic": "Detailed prompt for vertical infographic image",
    "fill": ["Prompt for image 1", "Prompt for image 2", "Prompt for image 3"]
  },
  "topics": ["topic-1", "topic-2", "topic-3"]
}
\`\`\``;
}

// ===== FAL.AI IMAGE GENERATION =====

async function generateImages(
  article: GeneratedArticle,
  slug: string
): Promise<{ infographic: string; fill: string[] }> {
  fal.config({ credentials: process.env.FAL_KEY });

  const imagesDir = 'public/images';

  // Generate infographic (portrait)
  const infographicResult = await fal.subscribe('fal-ai/fast-sdxl', {
    input: {
      prompt: article.imageData.infographic,
      image_size: { width: 720, height: 1280 },
      num_images: 1,
    },
  });

  const infographicPath = `${imagesDir}/${slug}-infographic.webp`;
  await downloadImage(infographicResult.images[0].url, infographicPath);

  // Generate fill images (landscape)
  const fillPaths: string[] = [];
  for (let i = 0; i < article.imageData.fill.length; i++) {
    const result = await fal.subscribe('fal-ai/flux-pro/v1.1-ultra', {
      input: {
        prompt: article.imageData.fill[i],
        aspect_ratio: '16:9',
        output_format: 'webp',
      },
    });

    const fillPath = `${imagesDir}/${slug}-${i + 1}.webp`;
    await downloadImage(result.images[0].url, fillPath);
    fillPaths.push(`/images/${slug}-${i + 1}.webp`);
  }

  return {
    infographic: `/images/${slug}-infographic.webp`,
    fill: fillPaths,
  };
}

// ===== MDX GENERATION =====

function writeMdxFile(
  article: GeneratedArticle,
  slug: string,
  images: { infographic: string; fill: string[] }
): string {
  const frontmatter = `---
title: "${article.title}"
description: "${article.description}"
publishedAt: ${new Date().toISOString().split('T')[0]}
image: ${images.fill[0]}
topics:
${article.topics.map(t => `  - ${t}`).join('\n')}
faqs:
${article.faqs.map(f => `  - question: "${f.question}"
    answer: "${f.answer}"`).join('\n')}
---

${article.content}
`;

  const filePath = `src/content/${article.category}/${slug}.mdx`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, frontmatter);

  return filePath;
}

// ===== UTILITIES =====

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function downloadImage(url: string, path: string): Promise<void> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(path, Buffer.from(buffer));
}

// Run
main().catch(console.error);
```

---

## 12. Image Generation Pipeline

### Two-Model Strategy

| Model | Use Case | Aspect Ratio | Cost |
|-------|----------|--------------|------|
| Nano Banana Pro / Fast SDXL | Infographic | 9:16 (portrait) | $0.15 |
| Flux Pro v1.1 Ultra | Fill images | 16:9 (landscape) | $0.06 |

### Branding & Watermarking

For branded infographics, use image composition after generation:

```typescript
import sharp from 'sharp';

async function brandInfographic(
  imagePath: string,
  title: string,
  outputPath: string
): Promise<void> {
  const logoBuffer = await sharp('public/logo.svg')
    .resize(200)
    .toBuffer();

  const image = sharp(imagePath);
  const metadata = await image.metadata();

  // Create branded layout
  const branded = await sharp({
    create: {
      width: metadata.width!,
      height: metadata.height! + 200, // Extra space for branding
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: logoBuffer, top: 20, left: 20 },
      { input: imagePath, top: 100 },
    ])
    .webp({ quality: 90 })
    .toFile(outputPath);
}
```

### Watermarking Fill Images

```typescript
async function addWatermark(
  imagePath: string,
  outputPath: string
): Promise<void> {
  const logoBuffer = await sharp('public/logo.svg')
    .resize(100)
    .composite([{
      input: Buffer.from([255, 255, 255, 180]), // 70% opacity
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'dest-in',
    }])
    .toBuffer();

  const image = sharp(imagePath);
  const metadata = await image.metadata();

  await image
    .composite([{
      input: logoBuffer,
      gravity: 'southeast',
      blend: 'over',
    }])
    .webp({ quality: 90 })
    .toFile(outputPath);
}
```

---

## 13. Keyword Research System

### initial-research.ts Architecture

```typescript
// scripts/initial-research.ts

import 'dotenv/config';
import * as fs from 'fs';

interface KeywordData {
  keyword: string;
  volume: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  cpc?: number;
}

interface QueueItem {
  keyword: string;
  volume: number;
  competition: string;
  score: number;
  status: 'pending' | 'generated' | 'duplicate' | 'published';
}

// ===== CONFIGURATION =====

const DATAFORSEO_API = 'https://api.dataforseo.com/v3';
const LOCATION_CODE = 2840;  // US (change for your target country)
const LANGUAGE_CODE = 'en';  // Change for your language

const SEED_CLUSTERS = {
  'cluster-1': ['seed keyword 1', 'seed keyword 2'],
  'cluster-2': ['seed keyword 3', 'seed keyword 4'],
  // Add more clusters...
};

// ===== SCORING =====

function calculateScore(volume: number, competition: string): number {
  const competitionScores: Record<string, number> = {
    LOW: 0.2,
    MEDIUM: 0.5,
    HIGH: 0.8,
  };
  return volume * (1 - competitionScores[competition]);
}

// ===== API FUNCTIONS =====

async function fetchSearchVolume(keywords: string[]): Promise<KeywordData[]> {
  const response = await fetch(
    `${DATAFORSEO_API}/keywords_data/google_ads/search_volume/live`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keywords,
        location_code: LOCATION_CODE,
        language_code: LANGUAGE_CODE,
      }]),
    }
  );

  const data = await response.json();
  return data.tasks[0].result.map((item: any) => ({
    keyword: item.keyword,
    volume: item.search_volume || 0,
    competition: item.competition || 'MEDIUM',
    cpc: item.cpc,
  }));
}

async function fetchRelatedKeywords(keyword: string): Promise<string[]> {
  const response = await fetch(
    `${DATAFORSEO_API}/keywords_data/google_ads/keywords_for_keywords/live`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keywords: [keyword],
        location_code: LOCATION_CODE,
        language_code: LANGUAGE_CODE,
      }]),
    }
  );

  const data = await response.json();
  return data.tasks[0].result
    .slice(0, 10)
    .map((item: any) => item.keyword);
}

// ===== MAIN =====

async function main() {
  console.log('Starting keyword research...');

  // 1. Collect all seed keywords
  const allSeeds = Object.values(SEED_CLUSTERS).flat();
  console.log(`Processing ${allSeeds.length} seed keywords...`);

  // 2. Fetch volume for seeds
  const seedData = await fetchSearchVolume(allSeeds);

  // 3. Expand with related keywords
  const topSeeds = seedData
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  const relatedKeywords: string[] = [];
  for (const seed of topSeeds) {
    const related = await fetchRelatedKeywords(seed.keyword);
    relatedKeywords.push(...related);
  }

  // 4. Deduplicate and fetch volume
  const uniqueRelated = [...new Set(relatedKeywords)]
    .filter(k => !allSeeds.includes(k));
  const relatedData = await fetchSearchVolume(uniqueRelated);

  // 5. Combine and score
  const allKeywords = [...seedData, ...relatedData];
  const scored: QueueItem[] = allKeywords.map(k => ({
    keyword: k.keyword,
    volume: k.volume,
    competition: k.competition,
    score: calculateScore(k.volume, k.competition),
    status: 'pending' as const,
  }));

  // 6. Sort by score and save
  scored.sort((a, b) => b.score - a.score);

  fs.writeFileSync(
    'scripts/keyword-queue.json',
    JSON.stringify(scored, null, 2)
  );

  fs.writeFileSync(
    'scripts/keyword-research-results.json',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      totalKeywords: scored.length,
      topKeywords: scored.slice(0, 20),
      clusters: SEED_CLUSTERS,
    }, null, 2)
  );

  console.log(`Saved ${scored.length} keywords to queue.`);
}

main().catch(console.error);
```

---

## 14. Deduplication System

### embeddings.ts Architecture

```typescript
// scripts/embeddings.ts

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import 'dotenv/config';

interface EmbeddingCache {
  model: string;
  articles: Array<{
    slug: string;
    title: string;
    embedding: number[];
  }>;
}

const CACHE_PATH = 'scripts/embeddings-cache.json';
const MODEL = 'text-embedding-3-small';
const SIMILARITY_THRESHOLD = 0.85;

// ===== EMBEDDING FUNCTIONS =====

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set - skipping embedding check');
    return null;
  }
  if (!openai) {
    openai = new OpenAI();
  }
  return openai;
}

export async function embedText(text: string): Promise<number[] | null> {
  const client = getOpenAI();
  if (!client) return null;

  const response = await client.embeddings.create({
    model: MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ===== CACHE MANAGEMENT =====

export function loadEmbeddingCache(): EmbeddingCache {
  if (fs.existsSync(CACHE_PATH)) {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
  }
  return { model: MODEL, articles: [] };
}

export async function saveEmbeddingCache(
  slug: string,
  title: string,
  description: string
): Promise<void> {
  const cache = loadEmbeddingCache();
  const embedding = await embedText(`${title}. ${description}`);

  if (!embedding) return;

  // Remove existing entry if present
  cache.articles = cache.articles.filter(a => a.slug !== slug);

  // Add new entry
  cache.articles.push({ slug, title, embedding });

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// ===== DUPLICATE CHECKING =====

export function checkExactSlugMatch(slug: string): string | null {
  const patterns = [
    `src/content/*/${slug}.mdx`,
    `src/content/*/${slug}.md`,
  ];

  for (const pattern of patterns) {
    const matches = glob.sync(pattern);
    if (matches.length > 0) {
      return matches[0];
    }
  }

  return null;
}

export async function findSimilar(
  keyword: string,
  threshold: number = SIMILARITY_THRESHOLD
): Promise<{ slug: string; title: string; similarity: number } | null> {
  const cache = loadEmbeddingCache();
  if (cache.articles.length === 0) return null;

  const embedding = await embedText(keyword);
  if (!embedding) return null;

  let bestMatch: { slug: string; title: string; similarity: number } | null = null;

  for (const article of cache.articles) {
    const similarity = cosineSimilarity(embedding, article.embedding);
    if (similarity >= threshold) {
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = {
          slug: article.slug,
          title: article.title,
          similarity,
        };
      }
    }
  }

  return bestMatch;
}
```

### Build Embedding Cache Script

```typescript
// scripts/build-embedding-cache.ts

import { glob } from 'glob';
import * as fs from 'fs';
import matter from 'gray-matter';
import { embedText } from './embeddings';
import 'dotenv/config';

async function main() {
  console.log('Building embedding cache...');

  const files = glob.sync('src/content/**/*.{md,mdx}');
  const cache = { model: 'text-embedding-3-small', articles: [] as any[] };

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const { data } = matter(content);

    const slug = file.split('/').pop()?.replace(/\.(md|mdx)$/, '') || '';
    const text = `${data.title}. ${data.description}`;

    console.log(`Embedding: ${slug}`);
    const embedding = await embedText(text);

    if (embedding) {
      cache.articles.push({
        slug,
        title: data.title,
        embedding,
      });
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  fs.writeFileSync('scripts/embeddings-cache.json', JSON.stringify(cache, null, 2));
  console.log(`Cached ${cache.articles.length} articles.`);
}

main().catch(console.error);
```

---

## 15. Social Media Automation

### post-social.ts Architecture

```typescript
// scripts/post-social.ts

import 'dotenv/config';
import * as fs from 'fs';

interface LastArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  url: string;
  images: {
    infographic: string;
    fill: string[];
  };
  topics: string[];
}

// ===== PINTEREST =====

async function postToPinterest(article: LastArticle): Promise<void> {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  const boardId = process.env.PINTEREST_BOARD_ID;

  if (!token || !boardId) {
    console.log('Pinterest credentials not configured, skipping...');
    return;
  }

  // Post each image as a pin
  const images = [article.images.infographic, ...article.images.fill];

  for (const image of images) {
    const imageUrl = `${article.url.replace(/\/[^/]+$/, '')}${image}`;

    await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board_id: boardId,
        title: article.title.slice(0, 100),
        description: `${article.description}\n\n${article.topics.slice(0, 5).map(t => `#${t}`).join(' ')}\n\nRead more: ${article.url}`,
        link: article.url,
        media_source: {
          source_type: 'image_url',
          url: imageUrl,
        },
        alt_text: article.title,
      }),
    });

    // Rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`Posted ${images.length} pins to Pinterest`);
}

// ===== FACEBOOK =====

async function postToFacebook(article: LastArticle): Promise<void> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    console.log('Facebook credentials not configured, skipping...');
    return;
  }

  const hashtags = article.topics.slice(0, 5).map(t => `#${t.replace(/-/g, '')}`).join(' ');

  const message = `${article.title}\n\n${article.description}\n\n${hashtags}\n\nRead more: ${article.url}`;

  await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/feed`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        link: article.url,
        access_token: accessToken,
      }),
    }
  );

  console.log('Posted to Facebook');
}

// ===== MAIN =====

async function main() {
  const lastArticlePath = 'scripts/last-article.json';

  if (!fs.existsSync(lastArticlePath)) {
    console.log('No last article found, skipping social posting.');
    return;
  }

  const article: LastArticle = JSON.parse(
    fs.readFileSync(lastArticlePath, 'utf-8')
  );

  console.log(`Posting: ${article.title}`);

  await postToPinterest(article);
  await postToFacebook(article);

  console.log('Social posting complete!');
}

main().catch(console.error);
```

---

## 16. GitHub Actions Workflows

### deploy.yml (On Push)

```yaml
# .github/workflows/deploy.yml

name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: your-project-name
          directory: dist
```

### keyword-research.yml (Weekly)

```yaml
# .github/workflows/keyword-research.yml

name: Keyword Research

on:
  schedule:
    - cron: '0 6 * * 0'  # Sundays at 6 AM UTC
  workflow_dispatch:

jobs:
  research:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run keyword research
        run: npm run research
        env:
          DATAFORSEO_LOGIN: ${{ secrets.DATAFORSEO_LOGIN }}
          DATAFORSEO_PASSWORD: ${{ secrets.DATAFORSEO_PASSWORD }}

      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: update keyword queue [automated]'
          file_pattern: 'scripts/*.json'
```

### publish-article.yml (2×/day)

```yaml
# .github/workflows/publish-article.yml

name: Generate and Publish Article

on:
  schedule:
    - cron: '15 7 * * *'   # 7:15 AM UTC
    - cron: '15 19 * * *'  # 7:15 PM UTC
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Generate article
        run: npm run generate
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          FAL_KEY: ${{ secrets.FAL_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Build site (verify)
        run: npm run build

      - name: Commit new article
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'content: add new article [automated]'
          file_pattern: 'src/content/**/*.mdx public/images/*.webp scripts/*.json'

      - name: Deploy to Cloudflare
        if: steps.auto-commit-action.outputs.changes_detected == 'true'
        run: npx wrangler pages deploy dist --project-name=your-project-name
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      - name: Post to social media
        run: npm run social
        continue-on-error: true
        env:
          PINTEREST_ACCESS_TOKEN: ${{ secrets.PINTEREST_ACCESS_TOKEN }}
          PINTEREST_BOARD_ID: ${{ secrets.PINTEREST_BOARD_ID }}
          FACEBOOK_PAGE_ID: ${{ secrets.FACEBOOK_PAGE_ID }}
          FACEBOOK_ACCESS_TOKEN: ${{ secrets.FACEBOOK_ACCESS_TOKEN }}
```

### GitHub Secrets to Configure

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude API for content |
| `FAL_KEY` | Fal.ai for images |
| `OPENAI_API_KEY` | Embeddings (optional) |
| `CLOUDFLARE_API_TOKEN` | Deployment |
| `CLOUDFLARE_ACCOUNT_ID` | Deployment |
| `DATAFORSEO_LOGIN` | Keyword research |
| `DATAFORSEO_PASSWORD` | Keyword research |
| `PINTEREST_ACCESS_TOKEN` | Social posting |
| `PINTEREST_BOARD_ID` | Social posting |
| `FACEBOOK_PAGE_ID` | Social posting |
| `FACEBOOK_ACCESS_TOKEN` | Social posting |

---

## 17. Implementation Checklists

### Initial Setup Checklist

- [ ] Create GitHub repository
- [ ] Initialize Astro project
- [ ] Install dependencies (mdx, sitemap, tailwind, rss)
- [ ] Configure TypeScript with path aliases
- [ ] Set up Tailwind with CSS custom properties
- [ ] Create directory structure
- [ ] Create site-config.ts
- [ ] Create content collection schema
- [ ] Create BaseLayout.astro
- [ ] Create ArticleLayout.astro
- [ ] Create core components
- [ ] Create SEO schema components
- [ ] Set up pages and routing
- [ ] Create robots.txt and llms.txt
- [ ] Test local development

### Configuration Checklist

- [ ] Define site identity (name, tagline, URL)
- [ ] Define categories (3-5 main categories)
- [ ] Define topics (15-25 for internal linking)
- [ ] Configure theme colors
- [ ] Configure fonts
- [ ] Set up content prompt for Claude
- [ ] Configure newsletter (if using)
- [ ] Set up network sites (if applicable)

### Content Generation Checklist

- [ ] Create generate-article.ts script
- [ ] Test Claude API integration
- [ ] Create image generation functions
- [ ] Test Fal.ai integration
- [ ] Create MDX file generation
- [ ] Create embeddings.ts for deduplication
- [ ] Build initial embedding cache
- [ ] Create keyword-queue.json structure
- [ ] Test full generation pipeline locally

### Deployment Checklist

- [ ] Create Cloudflare Pages project
- [ ] Configure build settings
- [ ] Add custom domain
- [ ] Create deploy.yml workflow
- [ ] Create publish-article.yml workflow
- [ ] Create keyword-research.yml workflow
- [ ] Add all secrets to GitHub
- [ ] Test deployment workflow
- [ ] Verify site is live

### Monitoring Checklist

- [ ] Set up Google Analytics 4
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up uptime monitoring
- [ ] Monitor GitHub Actions for failures
- [ ] Check content quality periodically
- [ ] Monitor search rankings
- [ ] Track traffic growth

---

## 18. Customization Guide

### Adapting to a New Niche

1. **Update site-config.ts:**
   - Change name, tagline, URL
   - Define new categories relevant to your niche
   - Define new topics for internal linking
   - Update content prompt for Claude

2. **Update content schema:**
   - Add niche-specific fields (e.g., difficulty, price, rating)
   - Adjust validation rules

3. **Update keyword research:**
   - Change seed clusters in initial-research.ts
   - Adjust location/language codes
   - Modify scoring weights if needed

4. **Update Claude prompt:**
   - Tailor audience and tone
   - Add niche-specific instructions
   - Adjust word count requirements

### Changing Design Theme

1. **Update CSS variables in global.css:**
   - Change color palette
   - Update shadows for different feel
   - Adjust border radius

2. **Update fonts:**
   - Choose appropriate font pairing
   - Update Google Fonts link in BaseLayout
   - Update font-family variables

3. **Update component styles:**
   - Adjust card designs
   - Modify header/footer aesthetics
   - Update animation patterns

### Modifying Categories

1. Update `categories` in site-config.ts
2. Create content collection folders
3. Update schema in content/config.ts
4. Update category pages
5. Update navigation components
6. Update Claude prompt with new categories

### Adjusting Automation Frequency

**Publish more often (e.g., 4×/day):**
```yaml
schedule:
  - cron: '15 1 * * *'
  - cron: '15 7 * * *'
  - cron: '15 13 * * *'
  - cron: '15 19 * * *'
```

**Publish less often (e.g., 1×/day):**
```yaml
schedule:
  - cron: '15 7 * * *'
```

**Research more frequently:**
```yaml
schedule:
  - cron: '0 6 * * 0,3'  # Sundays and Wednesdays
```

### Adding/Removing Features

**Remove social posting:**
- Delete post-social.ts
- Remove social step from publish-article.yml
- Remove social environment variables

**Add email collection:**
- Integrate with email provider (Buttondown, ConvertKit, etc.)
- Create newsletter signup component
- Add to layouts/pages

**Add search:**
- Pagefind is already configured in build
- Create search page component
- Add search input to header

---

## 19. Quick Reference

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...      # Content generation
FAL_KEY=...                        # Image generation
CLOUDFLARE_API_TOKEN=...           # Deployment
CLOUDFLARE_ACCOUNT_ID=...          # Deployment
DATAFORSEO_LOGIN=...               # Keyword research
DATAFORSEO_PASSWORD=...            # Keyword research

# Optional
OPENAI_API_KEY=sk-...              # Deduplication
PUBLIC_GA4_ID=G-...                # Analytics
PINTEREST_ACCESS_TOKEN=pina_...    # Social
PINTEREST_BOARD_ID=...             # Social
FACEBOOK_PAGE_ID=...               # Social
FACEBOOK_ACCESS_TOKEN=...          # Social
```

### NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| dev | `npm run dev` | Start dev server |
| build | `npm run build` | Build + search index |
| preview | `npm run preview` | Preview build |
| research | `npm run research` | Keyword research |
| generate | `npm run generate` | Generate article |
| social | `npm run social` | Post to social |

### File Path Reference

| Purpose | Path |
|---------|------|
| Site config | `src/site-config.ts` |
| Content schema | `src/content/config.ts` |
| Global styles | `src/styles/global.css` |
| Base layout | `src/layouts/BaseLayout.astro` |
| Article layout | `src/layouts/ArticleLayout.astro` |
| Components | `src/components/` |
| SEO schemas | `src/components/SEO/` |
| Pages | `src/pages/` |
| Content | `src/content/{category}/` |
| Static assets | `public/` |
| Images | `public/images/` |
| Scripts | `scripts/` |
| Workflows | `.github/workflows/` |
| Keyword queue | `scripts/keyword-queue.json` |
| Embedding cache | `scripts/embeddings-cache.json` |

### Cost Estimates

| Scenario | Monthly Cost |
|----------|--------------|
| 14 articles/week | $29-38 |
| 7 articles/week | $15-19 |
| 28 articles/week | $58-76 |

### API Rate Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Claude API | 4,000 RPM | Varies by tier |
| Fal.ai | 60 RPM | Depends on plan |
| DataForSEO | 2,000 requests/day | Standard plan |
| OpenAI | 3,500 RPM | Depends on tier |
| Pinterest | 1,000/day | Per-app limit |
| Facebook | 200/hour | Page posting |

---

*This blueprint is based on production implementations. Adapt to your specific requirements and scale.*
