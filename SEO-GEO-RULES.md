# SEO & GEO Best Practices for Claude Code

A comprehensive guide for building websites optimized for both Search Engine Optimization (SEO) and Generative Engine Optimization (GEO). Contains universal principles with Astro/framework-specific examples. Based on production implementations.

---

## Table of Contents

1. [Core Principles](#1-core-principles)
2. [Meta Tags](#2-meta-tags)
3. [JSON-LD Structured Data](#3-json-ld-structured-data)
4. [Recipe-Specific Implementation](#4-recipe-specific-implementation)
5. [GEO-Specific Requirements](#5-geo-specific-requirements)
6. [Internal Linking Strategy](#6-internal-linking-strategy)
7. [Social & Platform Integrations](#7-social--platform-integrations)
8. [Client-Side Features](#8-client-side-features)
9. [Print Optimization](#9-print-optimization)
10. [Analytics & Tracking](#10-analytics--tracking)
11. [Required Static Files](#11-required-static-files)
12. [Content Schema Validation](#12-content-schema-validation)
13. [Implementation Checklists](#13-implementation-checklists)
14. [Environment Variables](#14-environment-variables)
15. [Quick Reference Tables](#15-quick-reference-tables)

---

## 1. Core Principles

### SEO Fundamentals

**Crawlability**
- Ensure all pages are reachable via internal links
- Submit XML sitemap to search engines
- Use semantic HTML (`<article>`, `<nav>`, `<section>`, `<aside>`)
- Implement breadcrumb navigation on all content pages

**Indexability**
- One canonical URL per page (avoid duplicate content)
- Use `robots.txt` to guide crawlers, not block important content
- Implement proper 301 redirects for moved content
- Return appropriate HTTP status codes (200, 404, 301)

**Authority Signals**
- Include author/organization attribution (E-E-A-T)
- Display publication and modification dates
- Link to authoritative external sources
- Build internal topic clusters through related content

### GEO Fundamentals

**AI Discoverability**
- Provide `llms.txt` file explaining site purpose and structure
- Use clear, factual definitions in opening paragraphs
- Structure content with descriptive headings (H2, H3)
- Include FAQ sections with schema markup

**Content Extraction**
- Write self-contained paragraphs that summarize key points
- Expand acronyms on first use
- Use tables for comparative data
- Keep sentences under 25 words for clarity

**Freshness Signals**
- Track both `published` and `modified` dates
- Update insights/statistics articles when data changes
- Prioritize recent content in related articles algorithms
- Document update frequency in llms.txt

### Core Web Vitals

**LCP (Largest Contentful Paint)**
- Use `fetchpriority="high"` on hero/featured images
- Use `loading="eager"` for above-the-fold images
- Preconnect to external font/resource domains
- Avoid lazy loading on LCP elements

```html
<!-- Hero image optimization -->
<img
  src="/images/hero.webp"
  width="1280"
  height="720"
  loading="eager"
  fetchpriority="high"
  decoding="async"
  alt="Description"
/>
```

**CLS (Cumulative Layout Shift)**
- Always specify width and height on images
- Use CSS aspect-ratio for responsive containers
- Use transform-only animations (never animate width/height/margin)
- Reserve space for dynamic content (ads, embeds)

```css
/* Prevent layout shift */
.card-image {
  aspect-ratio: 16 / 10;
  width: 100%;
  object-fit: cover;
}

/* Safe hover animations */
.card:hover {
  transform: translateY(-4px);  /* Good */
  /* margin-top: -4px;  Bad - causes layout shift */
}
```

**FID/INP (Interaction Responsiveness)**
- Minimize JavaScript payload (use static site generation)
- Defer non-critical scripts
- Clean up event listeners on component unmount
- Avoid long-running synchronous operations

---

## 2. Meta Tags

### Open Graph Tags (Required)

```html
<meta property="og:type" content="article" />  <!-- or "website" for non-articles -->
<meta property="og:url" content="https://example.com/page" />
<meta property="og:title" content="Page Title (60 chars max)" />
<meta property="og:description" content="Description (160 chars max)" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Site Name" />
<meta property="og:locale" content="en_US" />
```

**Requirements:**
- Image dimensions: 1200x630px (2:1 aspect ratio)
- Use absolute URLs for images
- Title: 60 characters maximum
- Description: 160 characters maximum

### Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@handle" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Description" />
<meta name="twitter:image" content="https://example.com/image.jpg" />
```

### Canonical URL

```html
<link rel="canonical" href="https://example.com/canonical-path" />
```

**Rules:**
- Every page must have exactly one canonical URL
- Self-referencing canonicals are acceptable
- Support canonical override via props for special cases

### Article Metadata (For Content Pages)

```html
<meta property="article:published_time" content="2024-01-15T00:00:00Z" />
<meta property="article:modified_time" content="2024-02-20T00:00:00Z" />
<meta property="article:section" content="Category Name" />
<meta property="article:tag" content="topic1" />
<meta property="article:tag" content="topic2" />
<meta name="author" content="Organization Name" />
```

### Google Discover Optimization

```html
<!-- Enable large image previews in Google Discover -->
<meta name="robots" content="max-image-preview:large" />
```

**Requirements for Discover eligibility:**
- High-quality images (at least 1200px wide)
- Compelling headlines (not clickbait)
- Fresh, timely content
- E-E-A-T signals (author, dates, sources)

### Robots Meta Patterns

```html
<!-- Default: Allow indexing with large image previews -->
<meta name="robots" content="max-image-preview:large" />

<!-- For pages that should not be indexed -->
<meta name="robots" content="noindex, nofollow" />

<!-- For pages with user-generated content -->
<meta name="robots" content="noindex, follow" />
```

### Smart Truncation Utility

```typescript
const SEO_LIMITS = {
  TITLE_MAX: 60,
  DESCRIPTION_MAX: 160,
};

export function truncateForSEO(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(' ');

  // Break at word boundary if within 80% of limit
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }
  return truncated + '...';
}
```

---

## 3. JSON-LD Structured Data

### Article Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article description",
  "datePublished": "2024-01-15",
  "dateModified": "2024-02-20",
  "image": {
    "@type": "ImageObject",
    "url": "https://example.com/image.jpg",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Organization",
    "name": "Author Name",
    "url": "https://author-url.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Publisher Name",
    "url": "https://example.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/article-url"
  },
  "inLanguage": "en-US",
  "keywords": "keyword1, keyword2, keyword3"
}
```

**Required fields:** headline, description, datePublished, author, publisher
**Recommended:** dateModified, image, keywords, inLanguage

### Recipe Schema

```json
{
  "@context": "https://schema.org/",
  "@type": "Recipe",
  "name": "Recipe Title",
  "description": "Recipe description",
  "image": ["https://example.com/recipe.jpg"],
  "author": {
    "@type": "Organization",
    "name": "Site Name",
    "url": "https://example.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Site Name",
    "url": "https://example.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.svg"
    }
  },
  "datePublished": "2024-01-15T00:00:00Z",
  "dateModified": "2024-01-20T00:00:00Z",
  "prepTime": "PT20M",
  "cookTime": "PT30M",
  "totalTime": "PT50M",
  "recipeYield": "4",
  "recipeCategory": "Main course",
  "recipeCuisine": "Polish",
  "recipeIngredient": [
    "2 cups flour",
    "1 cup milk",
    "2 eggs"
  ],
  "recipeInstructions": [
    {
      "@type": "HowToStep",
      "position": 1,
      "text": "Mix flour and milk in a large bowl."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "text": "Add eggs and whisk until smooth."
    }
  ]
}
```

**Required fields:** name, image, recipeIngredient, recipeInstructions
**Recommended:** prepTime, cookTime, recipeYield, recipeCategory, recipeCuisine

### FAQPage Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the question?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The complete answer text."
      }
    }
  ]
}
```

**Rules:**
- Only render if FAQs exist (conditional)
- Minimum 3 FAQs recommended for rich snippet eligibility
- Answers should be comprehensive (2-4 sentences)

### BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Category",
      "item": "https://example.com/category"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Article Title",
      "item": "https://example.com/category/article"
    }
  ]
}
```

**Structure:** Home > Category > Current Page (3 levels typical)

### Organization Schema (Homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Organization Name",
  "url": "https://example.com",
  "description": "What the organization does",
  "logo": {
    "@type": "ImageObject",
    "url": "https://example.com/logo.svg"
  },
  "parentOrganization": {
    "@type": "Organization",
    "name": "Parent Company",
    "url": "https://parent.com"
  }
}
```

### WebSite Schema (Homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Site Name",
  "url": "https://example.com",
  "description": "Site description",
  "inLanguage": "en-US",
  "publisher": {
    "@type": "Organization",
    "name": "Publisher Name"
  }
}
```

### CollectionPage Schema (Category/Topic Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Category Name",
  "description": "Category description",
  "url": "https://example.com/category",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Site Name",
    "url": "https://example.com"
  },
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": 25,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://example.com/category/article-1"
      }
    ]
  }
}
```

---

## 4. Recipe-Specific Implementation

### Markdown Parsing for Ingredients

Extract ingredients from a markdown section (e.g., `## Ingredients` or `## Składniki`):

```typescript
function extractIngredients(markdown: string): string[] {
  // Match section starting with "## Ingredients" (with any suffix)
  const sectionMatch = markdown.match(
    /##\s*Ingredients[^\n]*\n([\s\S]*?)(?=\n##|\n$|$)/i
  );

  if (!sectionMatch) return [];

  const section = sectionMatch[1];
  const ingredients: string[] = [];

  for (const line of section.split('\n')) {
    // Match bullet points: "- ingredient" or "* ingredient"
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);
    if (bulletMatch) {
      const ingredient = bulletMatch[1].trim();
      // Skip sub-headers or empty lines
      if (!ingredient.startsWith('#') && ingredient.length > 0) {
        ingredients.push(ingredient);
      }
    }
  }

  return ingredients;
}
```

### Markdown Parsing for Instructions

Extract numbered steps as HowToStep objects:

```typescript
function extractInstructions(markdown: string): HowToStep[] {
  // Match section starting with "## Instructions" or "## Preparation"
  const sectionMatch = markdown.match(
    /##\s*(Instructions|Preparation|Przygotowanie)[^\n]*\n([\s\S]*?)(?=\n##\s*(?:FAQ|Tips|Notes)|\n$|$)/i
  );

  if (!sectionMatch) return [];

  const section = sectionMatch[2];
  const instructions: HowToStep[] = [];
  let stepNumber = 0;

  for (const line of section.split('\n')) {
    // Match numbered steps: "1. Step text"
    const numberedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    if (numberedMatch) {
      stepNumber++;
      let text = numberedMatch[1].trim();
      // Remove markdown bold markers
      text = text.replace(/\*\*([^*]+)\*\*/g, '$1');

      if (text.length > 0) {
        instructions.push({
          '@type': 'HowToStep',
          position: stepNumber,
          text: text
        });
      }
    }
  }

  return instructions;
}
```

### Time Conversion to ISO 8601

Convert human-readable time strings to ISO 8601 duration format:

```typescript
// "20 minutes" → "PT20M"
// "1 hour" → "PT1H"
// "1.5 hours" → "PT1H30M"
// Polish: "20 minut" → "PT20M", "1 godzina" → "PT1H"

function parseTimeToISO(timeStr?: string): string | undefined {
  if (!timeStr) return undefined;

  const hourMatch = timeStr.match(/(\d+(?:[.,]\d+)?)\s*(hours?|godzin)/i);
  const minuteMatch = timeStr.match(/(\d+)\s*(minutes?|minut)/i);

  let totalMinutes = 0;

  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1].replace(',', '.')) * 60;
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }

  if (totalMinutes === 0) return undefined;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `PT${hours}H${minutes}M`;
  } else if (hours > 0) {
    return `PT${hours}H`;
  } else {
    return `PT${minutes}M`;
  }
}
```

### Servings Extraction

Extract numeric servings from string:

```typescript
// "4 servings" → "4"
// "4 porcje" → "4"
function parseServings(servingsStr?: string): string | undefined {
  if (!servingsStr) return undefined;
  const match = servingsStr.match(/(\d+)/);
  return match ? match[1] : undefined;
}
```

### Category Mapping

Map site categories to schema.org recipeCategory:

```typescript
const RECIPE_CATEGORY_MAP: Record<string, string> = {
  'recipes': 'Main course',
  'quick-meals': 'Quick meals',
  'soups': 'Soup',
  'desserts': 'Dessert',
  // Polish
  'przepisy': 'Main course',
  'szybkie-dania': 'Quick meals',
  'zupy': 'Soup',
  'desery': 'Dessert'
};
```

---

## 5. GEO-Specific Requirements

### llms.txt File

Place at `/public/llms.txt` (accessible at `https://example.com/llms.txt`)

**Template:**

```
# Site Name

[One paragraph explaining site purpose, target audience, and content focus.
Keep it concise but informative for AI systems.]

## Content Categories

- **Category 1**: What this category covers
- **Category 2**: What this category covers
- **Category 3**: What this category covers

## Main Topics

topic1, topic2, topic3, topic4, topic5, topic6, topic7, topic8, topic9, topic10

## Quality & Freshness

- Frequency: [How often new content is published, e.g., "2 new articles daily"]
- Sources: [Primary sources for information]
- Verification: [How content is validated]

## Target Audience

[Who the content is written for - be specific about skill level, interests, etc.]

## About

[Brief company/author background for authority - 1-2 sentences]
```

**Example (Recipe Site):**

```
# Ugotuj Mi

Ugotuj Mi to polski serwis kulinarny oferujący sprawdzone przepisy, porady
i praktyczne wskazówki dla domowych kucharzy. Publikujemy zarówno tradycyjne
polskie receptury, jak i nowoczesne interpretacje klasycznych dań.

## Content Categories

- **Przepisy**: Szczegółowe przepisy na dania główne, przekąski i dodatki
- **Szybkie Dania**: Posiłki gotowe w 30 minut lub mniej
- **Zupy**: Domowe zupy, kremy i buliony
- **Desery**: Ciasta, ciasteczka, desery i słodycze

## Main Topics

przepisy kulinarne, polska kuchnia, gotowanie w domu, naleśniki, gofry,
pierogi, zupy, rosół, ciasta, szybkie obiady, desery, techniki kulinarne

## Quality & Freshness

- Frequency: 2 new articles daily
- Sources: Tested recipes, proven culinary techniques
- Verification: Each recipe is tested before publication

## Target Audience

Polish home cooks - from beginners to intermediate - looking for reliable
recipes and practical cooking tips.

## About

Created with love for good food and a desire to share tested recipes
with Polish home cooks.
```

### First-Paragraph Definition Pattern

**For definition/glossary articles:**

```markdown
[TERM] ([Acronym Expansion]) is [category/type] [developed/created by authority]
that [primary function]. [Analogy or context for understanding].
[Why it matters to the reader].
```

**Example:**
```markdown
VAST (Video Ad Serving Template) is an industry-standard XML schema developed
by the Interactive Advertising Bureau (IAB) that enables video players to request
and display video advertisements from ad servers. Think of it as a common language
that allows different video players and ad servers to work together seamlessly.
Publishers use VAST to monetize video content across any compliant player.
```

**Requirements:**
- Expand acronyms on first use
- Cite authoritative body if applicable
- Include functional explanation
- Add relatable analogy
- State relevance to reader

### FAQ Implementation

**Structure:**
```typescript
interface FAQ {
  question: string;  // Complete question with "?"
  answer: string;    // 2-4 sentence comprehensive answer
}
```

**Best practices:**
- 5-7 FAQs per article
- First FAQ should open by default (accessibility)
- Questions should be searchable queries users actually ask
- Answers should be self-contained (no "as mentioned above")
- Include the FAQPage JSON-LD schema

**HTML Pattern (semantic):**
```html
<details open>  <!-- First one opens by default -->
  <summary>Question text here?</summary>
  <div>Answer text here.</div>
</details>
```

### Content Structure for AI Summarization

**Heading Hierarchy:**
- H1: Page title (one per page)
- H2: Main sections (appear in TOC)
- H3: Subsections (appear in TOC, indented)
- H4: Deep subsections (not in TOC)

**Paragraph Guidelines:**
- Lead with the main point (inverted pyramid)
- One idea per paragraph
- 3-5 sentences maximum
- Use bullet lists for multiple related items

**Table Usage:**
- Use tables for comparisons, specifications, version differences
- Include header row
- Keep cells concise

### Freshness Signals

1. **Publication Date**: Required on all articles
2. **Modified Date**: Track separately, display "Updated: [date]" badge
3. **Freshness Bonus**: Weight recent content higher in related articles (+2 points for <30 days)
4. **llms.txt**: State update frequency explicitly

---

## 6. Internal Linking Strategy

### Related Articles Algorithm

**Scoring system (per article):**
```typescript
function calculateRelatedScore(
  currentTopics: string[],
  currentCategory: string,
  article: Article
): number {
  let score = 0;

  // +3 points per shared topic (highest priority)
  const sharedTopics = currentTopics.filter(t =>
    article.data.topics?.includes(t)
  );
  score += sharedTopics.length * 3;

  // +2 points for same category
  if (article.collection === currentCategory) {
    score += 2;
  }

  // +2 points for freshness (< 30 days old)
  const publishDate = new Date(article.data.publishedAt);
  const daysSince = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 30) {
    score += 2;
  }

  return score;
}

// Usage: Sort by score descending, take top 3
const relatedArticles = allArticles
  .filter(a => a.slug !== currentSlug)
  .map(article => ({ article, score: calculateRelatedScore(...) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 3)
  .map(s => s.article);
```

**Display:** Top 3 related articles, sorted by score (highest first)

### Topic Taxonomy Guidelines

**Rules for defining topics:**
- 3-7 topics per article
- Use lowercase, hyphenated slugs
- Be specific (prefer "header-bidding" over "advertising")
- Reuse existing topics for clustering
- Maintain a curated list of allowed topics

```typescript
// Example curated topic list
const ALLOWED_TOPICS = [
  'nalesniki', 'obiad', 'ciasto', 'gofry', 'zupa',
  'pizza', 'pierogi', 'sernik', 'omlet', 'rosol',
  'tiramisu', 'carbonara', 'biszkopt', 'leczo',
  'pomidorowa', 'dyniowa', 'grzybowa', 'wigilia',
  'swieta', 'grillowanie'
] as const;
```

### Topic Aggregation Pages

Create `/topics/[topic]` pages that:
- List all articles tagged with that topic
- Include CollectionPage + ItemList schema
- Sort by date (newest first) or relevance
- Cross all categories (recipes + quick-meals + soups + desserts)

**Benefits:**
- Creates semantic topic clusters
- Improves internal link distribution
- Helps AI models understand content relationships

### Breadcrumb Navigation

**Visual + Schema markup:**
```
HOME / CATEGORY / ARTICLE TITLE
```

**Requirements:**
- Always include Home link
- Category links to listing page
- Current page is text (not link)
- Use `aria-label="Breadcrumb"` for accessibility
- Use `aria-current="page"` on current item

### Cross-Category Discovery

- Related articles should include 1-2 articles from other categories
- Topic pages aggregate across all categories
- Footer/sidebar can show "Popular in [Other Category]"
- Difficulty level pages aggregate across categories

### Difficulty Level Pages

For recipe sites, create filter pages by difficulty:

```
/difficulty/easy     → All easy recipes
/difficulty/medium   → All medium recipes
/difficulty/hard     → All hard recipes
```

Each page:
- CollectionPage schema
- Breadcrumbs
- Articles sorted by date
- Cross-category aggregation

---

## 7. Social & Platform Integrations

### Pinterest Integration (Critical for Recipes)

**Save Button on Hero Image:**
```html
<a
  href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`}
  target="_blank"
  rel="noopener noreferrer"
  class="pinterest-save-btn"
  aria-label="Save to Pinterest"
>
  <svg><!-- Pinterest icon --></svg>
  Save
</a>
```

**Styling:**
```css
.pinterest-save-btn {
  background-color: #E60023;  /* Pinterest red */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 24px;
  position: absolute;
  top: 1rem;
  right: 1rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-container:hover .pinterest-save-btn,
.pinterest-save-btn:focus {
  opacity: 1;
}

/* Always visible on mobile/touch */
@media (hover: none) {
  .pinterest-save-btn {
    opacity: 1;
  }
}
```

### Social Share Component

```typescript
interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  image?: string;
}

// URL patterns for each platform
const shareUrls = {
  pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
};
```

### Native Share API with Clipboard Fallback

```typescript
async function handleShare(url: string, title: string) {
  // Try native share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (e) {
      // User cancelled or error - fall through to copy
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied!');
  } catch (e) {
    console.error('Failed to copy:', e);
  }
}
```

### Open Graph Image Requirements

| Platform | Dimensions | Aspect Ratio | Notes |
|----------|------------|--------------|-------|
| Facebook | 1200×630 | 1.91:1 | Standard OG size |
| Twitter | 1200×630 | 1.91:1 | summary_large_image |
| Pinterest | 1000×1500 | 2:3 | Vertical preferred |
| LinkedIn | 1200×627 | 1.91:1 | Similar to Facebook |

---

## 8. Client-Side Features

### Servings Scaler

Allow users to scale recipe ingredients:

```typescript
// Component state
const [servings, setServings] = useState(defaultServings);
const scaleFactor = servings / defaultServings;

// Scale ingredient quantities
function scaleIngredient(original: string): string {
  return original.replace(/(\d+(?:[.,]\d+)?)/g, (match) => {
    const num = parseFloat(match.replace(',', '.'));
    const scaled = num * scaleFactor;
    // Format nicely (avoid 1.333333...)
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
  });
}

// Persist preference
useEffect(() => {
  localStorage.setItem(`servings-${slug}`, servings.toString());
}, [servings, slug]);
```

### Recipe Save/Bookmark System

```typescript
// Check if saved
function isRecipeSaved(slug: string): boolean {
  const saved = JSON.parse(localStorage.getItem('saved-recipes') || '[]');
  return saved.includes(slug);
}

// Toggle save state
function toggleSaveRecipe(slug: string): boolean {
  const saved = JSON.parse(localStorage.getItem('saved-recipes') || '[]');
  const index = saved.indexOf(slug);

  if (index > -1) {
    saved.splice(index, 1);
  } else {
    saved.push(slug);
  }

  localStorage.setItem('saved-recipes', JSON.stringify(saved));
  return index === -1; // Returns new saved state
}
```

### Jump to Recipe Functionality

```typescript
function jumpToRecipe() {
  const ingredientsSection = document.querySelector('h2[id*="ingredient"], h2[id*="skladniki"]');
  if (ingredientsSection) {
    ingredientsSection.scrollIntoView({ behavior: 'smooth' });
  }
}
```

### Copy-to-Clipboard with Feedback

```typescript
async function copyToClipboard(text: string, button: HTMLButtonElement) {
  try {
    await navigator.clipboard.writeText(text);

    // Visual feedback
    button.classList.add('copied');
    button.textContent = 'Copied!';

    setTimeout(() => {
      button.classList.remove('copied');
      button.textContent = 'Copy link';
    }, 2000);
  } catch (e) {
    console.error('Copy failed:', e);
  }
}
```

---

## 9. Print Optimization

### Print Styles for Recipes

```css
@media print {
  /* Reset background and colors */
  html, body {
    background: white !important;
    color: black !important;
    font-size: 12pt;
    line-height: 1.5;
  }

  /* Hide non-essential elements */
  header,
  footer,
  nav,
  .sidebar,
  .social-share,
  .recipe-actions,
  .related-articles,
  .faq-section,
  .newsletter-form,
  .promo-block,
  [data-no-print] {
    display: none !important;
  }

  /* Reset transforms and animations */
  * {
    transform: none !important;
    animation: none !important;
    transition: none !important;
    box-shadow: none !important;
  }

  /* Full width content */
  .container, .article-content {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Typography */
  .article-title {
    font-size: 24pt !important;
    margin-bottom: 0.5rem !important;
  }

  h2 {
    font-size: 16pt !important;
    page-break-after: avoid !important;
  }

  h3 {
    font-size: 14pt !important;
    page-break-after: avoid !important;
  }

  /* Checkboxes for ingredients */
  .article-content ul {
    list-style: none !important;
    padding-left: 1.5rem !important;
  }

  .article-content ul li::before {
    content: "☐" !important;
    position: absolute;
    left: -1.25rem;
    font-size: 14pt;
  }

  /* Show external URLs */
  a[href^="http"]:not([href*="yourdomain.com"])::after {
    content: " (" attr(href) ")";
    font-size: 9pt;
    color: #666;
    word-break: break-all;
  }

  /* Page breaks */
  h1, h2, h3 {
    page-break-after: avoid;
  }

  img, figure {
    page-break-inside: avoid;
  }

  p {
    orphans: 3;
    widows: 3;
  }

  /* Hide in-content images (keep featured image) */
  .article-content img {
    display: none !important;
  }

  /* Print header */
  .article-page::before {
    content: "yourdomain.com";
    display: block;
    text-align: right;
    font-size: 10pt;
    color: #999;
    margin-bottom: 0.5rem;
  }

  /* Page margins and numbers */
  @page {
    margin: 1.5cm;
    @bottom-center {
      content: counter(page);
    }
  }
}
```

---

## 10. Analytics & Tracking

### Google Analytics 4

**Conditional Loading Pattern:**

```astro
---
const ga4Id = import.meta.env.PUBLIC_GA4_ID;
---

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
```

**Benefits:**
- Only loads if GA4_ID is configured
- No tracking in development
- Environment-based configuration

### Event Tracking Examples

```typescript
// Track recipe print
function trackPrint(recipeTitle: string) {
  gtag('event', 'print_recipe', {
    recipe_title: recipeTitle,
  });
}

// Track recipe save
function trackSave(recipeTitle: string, saved: boolean) {
  gtag('event', saved ? 'save_recipe' : 'unsave_recipe', {
    recipe_title: recipeTitle,
  });
}

// Track social share
function trackShare(platform: string, recipeTitle: string) {
  gtag('event', 'share', {
    method: platform,
    content_type: 'recipe',
    item_id: recipeTitle,
  });
}
```

---

## 11. Required Static Files

### robots.txt

```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

**Rules:**
- Allow all crawlers by default
- Reference sitemap with absolute URL
- Only disallow truly private paths (admin, api, etc.)

### Sitemap Configuration

**For Astro:**
```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()]
});
```

**Requirements:**
- Auto-generate from all routes
- Include lastmod dates when possible
- Submit to Google Search Console and Bing Webmaster Tools

### RSS Feed

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';

export async function GET(context) {
  const articles = await getAllArticles();

  return rss({
    title: 'Site Name',
    description: 'Site description',
    site: context.site,
    customData: '<language>en-us</language>',
    items: articles.map(article => ({
      title: article.title,
      description: article.description,
      pubDate: new Date(article.date),
      link: `/${article.category}/${article.slug}/`,
      author: 'contact@example.com (Site Name)',
      categories: [article.category, ...article.topics]
    }))
  });
}
```

**Head reference:**
```html
<link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
```

---

## 12. Content Schema Validation

### Zod Schema (Astro/TypeScript)

```typescript
import { z, defineCollection } from 'astro:content';

const faqSchema = z.object({
  question: z.string().min(10),
  answer: z.string().min(20)
});

const articleSchema = z.object({
  // Required fields
  title: z.string()
    .min(10, 'Title too short for SEO')
    .max(100, 'Title will be truncated'),
  description: z.string()
    .min(50, 'Description too short for SEO')
    .max(250, 'Description will be truncated'),
  publishedAt: z.coerce.date(),

  // Optional but recommended
  updatedAt: z.coerce.date().optional(),
  image: z.string().optional(),
  topics: z.array(z.string()).min(3).max(7).default([]),
  faqs: z.array(faqSchema).optional(),

  // Recipe-specific
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.string().optional(),

  // Control flags
  draft: z.boolean().default(false),
  noindex: z.boolean().default(false)
});

export const collections = {
  recipes: defineCollection({ schema: articleSchema }),
  'quick-meals': defineCollection({ schema: articleSchema }),
  soups: defineCollection({ schema: articleSchema }),
  desserts: defineCollection({ schema: articleSchema })
};
```

### Required vs Optional Fields

| Field | Required | SEO Impact | GEO Impact |
|-------|----------|------------|------------|
| title | Yes | H1, og:title, twitter:title | AI extraction |
| description | Yes | meta description, og:description | AI summary |
| publishedAt | Yes | article:published_time | Freshness |
| updatedAt | No | article:modified_time | Freshness boost |
| image | No | og:image, twitter:image | Visual snippets |
| topics | No | Internal linking, keywords | Topic clustering |
| faqs | No | FAQPage schema | Q&A extraction |
| difficulty | No | Filter pages | Recipe categorization |
| prepTime | No | Recipe schema | Time display |
| cookTime | No | Recipe schema | Time display |
| servings | No | Recipe schema | Yield display |

### Topics Array Guidelines

```yaml
topics: ["primary-topic", "secondary-topic", "related-concept"]
```

**Rules:**
- 3-7 topics per article
- Use lowercase, hyphenated slugs
- Be specific (prefer "header-bidding" over "advertising")
- Reuse existing topics for clustering

---

## 13. Implementation Checklists

### Homepage SEO Checklist

- [ ] Organization JSON-LD schema
- [ ] WebSite JSON-LD schema
- [ ] og:type = "website"
- [ ] Canonical URL set
- [ ] H1 tag present (site name or tagline)
- [ ] Internal links to all main categories
- [ ] Latest articles section
- [ ] Skip to content link for accessibility

### Article Page Checklist

- [ ] Article JSON-LD schema with all fields
- [ ] FAQPage JSON-LD (if FAQs present)
- [ ] BreadcrumbList JSON-LD
- [ ] og:type = "article"
- [ ] article:published_time meta tag
- [ ] article:modified_time meta tag (if applicable)
- [ ] article:section meta tag
- [ ] article:tag meta tags (from topics)
- [ ] Canonical URL
- [ ] H1 = article title
- [ ] Table of contents (if >2 headings)
- [ ] Related articles section (3 items)
- [ ] Author attribution
- [ ] FAQs with expandable UI

### Recipe Page Checklist

- [ ] Recipe JSON-LD schema with all fields
- [ ] Ingredients extracted from markdown
- [ ] Instructions as HowToStep objects
- [ ] prepTime, cookTime, totalTime in ISO 8601
- [ ] recipeYield from servings
- [ ] recipeCategory mapped from site category
- [ ] recipeCuisine specified
- [ ] Article JSON-LD schema (in addition to Recipe)
- [ ] FAQPage JSON-LD (if FAQs present)
- [ ] BreadcrumbList JSON-LD
- [ ] Pinterest Save button on hero image
- [ ] Social share buttons
- [ ] Jump to recipe button
- [ ] Print button
- [ ] Save recipe button
- [ ] Servings scaler (optional)

### Category Page Checklist

- [ ] CollectionPage JSON-LD schema
- [ ] ItemList with all articles
- [ ] BreadcrumbList JSON-LD
- [ ] Canonical URL
- [ ] H1 = category name
- [ ] Category description
- [ ] Article count
- [ ] Sorted article list
- [ ] Pagination (if >20 articles)

### GEO Optimization Checklist

- [ ] llms.txt file at /llms.txt
- [ ] Clear first-paragraph definitions
- [ ] Acronyms expanded on first use
- [ ] 5-7 FAQs per article
- [ ] FAQPage schema implemented
- [ ] Modified dates tracked and displayed
- [ ] Topics array for semantic linking
- [ ] Related articles algorithm uses topic scoring
- [ ] Topic aggregation pages exist
- [ ] Content uses semantic HTML
- [ ] Headings follow H2 > H3 > H4 hierarchy
- [ ] Tables used for comparisons
- [ ] Bullet lists for multiple items
- [ ] Update frequency documented in llms.txt

### Technical SEO Checklist

- [ ] robots.txt allows crawling
- [ ] Sitemap auto-generated
- [ ] RSS feed available
- [ ] RSS feed linked in head
- [ ] 404 page implemented
- [ ] All pages return 200 status
- [ ] No broken internal links
- [ ] Images have alt text
- [ ] Images optimized (WebP format)
- [ ] Mobile responsive
- [ ] Core Web Vitals passing
- [ ] HTTPS enforced

### Print Optimization Checklist

- [ ] Header/footer hidden in print
- [ ] Navigation hidden in print
- [ ] Social share buttons hidden in print
- [ ] Related articles hidden in print
- [ ] FAQs hidden in print (optional)
- [ ] Ingredient checkboxes added
- [ ] External URLs shown in parentheses
- [ ] Page breaks avoid headings
- [ ] Images don't break across pages
- [ ] Domain shown in print header
- [ ] Reasonable page margins

### Social Integration Checklist

- [ ] Pinterest Save button on images
- [ ] Facebook share button
- [ ] WhatsApp share button
- [ ] Copy link button with feedback
- [ ] Native Share API support
- [ ] Open Graph image (1200x630)
- [ ] Twitter Card configured
- [ ] Platform-specific colors/styling

### Core Web Vitals Checklist

- [ ] Hero image uses fetchpriority="high"
- [ ] Hero image uses loading="eager"
- [ ] Card images use loading="lazy"
- [ ] All images have width/height attributes
- [ ] CSS aspect-ratio used for containers
- [ ] Animations use transform only
- [ ] Fonts preconnected
- [ ] Font-display: swap configured
- [ ] Minimal JavaScript payload
- [ ] Event listeners cleaned up

---

## 14. Environment Variables

### Content Generation

```bash
ANTHROPIC_API_KEY         # Claude API for content generation
FAL_KEY                   # Fal.ai for image generation
OPENAI_API_KEY            # Embeddings for deduplication
```

### Analytics & Tracking

```bash
PUBLIC_GA4_ID             # Google Analytics 4 Measurement ID
```

### Social Integrations

```bash
PINTEREST_ACCESS_TOKEN    # Pinterest API (for automation)
PINTEREST_BOARD_ID        # Target board for pins
FACEBOOK_PAGE_ID          # Facebook page ID
FACEBOOK_ACCESS_TOKEN     # Long-lived page access token
```

### Keyword Research

```bash
DATAFORSEO_LOGIN          # DataForSEO API login
DATAFORSEO_PASSWORD       # DataForSEO API password
```

### Deployment

```bash
CLOUDFLARE_API_TOKEN      # Cloudflare Pages deployment
CLOUDFLARE_ACCOUNT_ID     # Cloudflare account identifier
```

### Newsletter

```bash
BUTTONDOWN_API_KEY        # Buttondown email service
BUTTONDOWN_USERNAME       # Buttondown newsletter username
```

---

## 15. Quick Reference Tables

### Meta Tag Limits

| Element | Limit | Truncation |
|---------|-------|------------|
| Title | 60 chars | Word boundary + ellipsis |
| Description | 160 chars | Word boundary + ellipsis |
| OG Image | 1200×630px | N/A |
| Topics | 3-7 items | N/A |
| FAQs | 5-7 items | N/A |

### Scoring Algorithm

| Signal | Points | Purpose |
|--------|--------|---------|
| Shared topic | +3 | Topical relevance |
| Same category | +2 | Content affinity |
| Fresh (<30 days) | +2 | Recency boost |

### Schema Coverage by Page Type

| Page Type | Required Schemas |
|-----------|------------------|
| Homepage | Organization, WebSite |
| Article | Article, FAQ*, Breadcrumb |
| Recipe | Recipe, Article, FAQ*, Breadcrumb |
| Category | CollectionPage, Breadcrumb |
| Topic | CollectionPage, Breadcrumb |
| Difficulty | CollectionPage, Breadcrumb |

*Only if FAQs present

### Platform Share URL Formats

| Platform | URL Pattern |
|----------|-------------|
| Pinterest | `https://pinterest.com/pin/create/button/?url={url}&media={image}&description={title}` |
| Facebook | `https://www.facebook.com/sharer/sharer.php?u={url}` |
| WhatsApp | `https://wa.me/?text={title}%20{url}` |
| Twitter | `https://twitter.com/intent/tweet?url={url}&text={title}` |
| LinkedIn | `https://www.linkedin.com/sharing/share-offsite/?url={url}` |

### ISO 8601 Duration Examples

| Human Readable | ISO 8601 |
|----------------|----------|
| 15 minutes | PT15M |
| 30 minutes | PT30M |
| 1 hour | PT1H |
| 1 hour 30 minutes | PT1H30M |
| 2 hours | PT2H |

---

## Framework Examples (Astro)

### BaseLayout Props Interface

```typescript
interface Props {
  title: string;
  description: string;
  ogImage?: string;
  articleDate?: string;
  articleModified?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  articleSection?: string;
  articleTags?: string[];
}
```

### ArticleLayout Integration

```astro
---
import BaseLayout from './BaseLayout.astro';
import FAQ from '../components/FAQ.astro';
import RelatedArticles from '../components/RelatedArticles.astro';
import TableOfContents from '../components/TableOfContents.astro';
import RecipeSchema from '../components/SEO/RecipeSchema.astro';
import ArticleSchema from '../components/SEO/ArticleSchema.astro';
import BreadcrumbSchema from '../components/SEO/BreadcrumbSchema.astro';

const { article, headings, content } = Astro.props;
const { title, description, publishedAt, updatedAt, topics, faqs, image } = article.data;
---

<BaseLayout
  title={title}
  description={description}
  ogImage={image}
  articleDate={publishedAt}
  articleModified={updatedAt}
  articleSection={article.collection}
  articleTags={topics}
>
  <!-- JSON-LD schemas -->
  <ArticleSchema {...article.data} url={canonicalUrl} />
  <RecipeSchema {...article.data} content={content} url={canonicalUrl} />
  {faqs?.length && <FAQSchema faqs={faqs} />}
  <BreadcrumbSchema items={breadcrumbs} />

  <!-- Content -->
  <article>
    <header><!-- breadcrumb, title, meta --></header>
    {headings.length > 2 && <TableOfContents headings={headings} />}
    <div class="article-content"><slot /></div>
    {faqs?.length && <FAQ faqs={faqs} />}
  </article>

  <RelatedArticles
    currentSlug={article.slug}
    currentCategory={article.collection}
    currentTopics={topics}
  />
</BaseLayout>
```

---

*This guide synthesizes best practices from production implementations. Adapt patterns to your specific framework and requirements.*
