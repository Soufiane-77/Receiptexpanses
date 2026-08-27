import { PAYMENTS_ENABLED } from "./features";

/** Central SEO constants and content. Update SITE_URL before deploying. */
export const SITE_URL = "https://receiptexpenses.com";
export const SITE_NAME = "ReceiptExpenses";

/**
 * Site-wide "content last reviewed" date (ISO + display), shown on evergreen
 * pages as a freshness signal for search/answer engines. Bump when you refresh
 * evergreen copy.
 */
export const LAST_UPDATED_ISO = "2026-08-27";
export const LAST_UPDATED_DISPLAY = "August 27, 2026";

/** First public release. Used as datePublished where a page has no own date. */
export const SITE_PUBLISHED_ISO = "2026-06-14";

/**
 * Canonical one-sentence definition of the product. Used verbatim in the hero,
 * meta descriptions, llms.txt and JSON-LD so LLMs and answer engines extract a
 * single consistent answer to "what is ReceiptExpenses?".
 */
export const SITE_DEFINITION =
  "ReceiptExpenses is a free, private online receipt maker that generates pixel-perfect PDF and PNG expense records directly in your browser — nothing is uploaded to a server.";

/** One-line pricing fact, kept in sync with PAYMENTS_ENABLED. */
export const PRICING_FACT = PAYMENTS_ENABLED
  ? "Building and previewing receipts is free; downloading, printing and saving require a Pro subscription ($6/month, cancel anytime)."
  : "ReceiptExpenses is free: build and preview without an account, and create a free account (email or Google) to download, print and save.";

/**
 * Google renders roughly 60 characters of <title> and 160 of description before
 * truncating and substituting its own text. Body copy is written to be read, so
 * it routinely runs longer — these two helpers keep the <head> inside the render
 * window without forcing the on-page copy to be short.
 */
export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 160;

/** Trim to `limit`, preferring a sentence boundary, else a word boundary. */
export function clampDescription(text: string, limit = DESCRIPTION_LIMIT): string {
  if (text.length <= limit) return text;
  const head = text.slice(0, limit - 1);
  const sentence = head.lastIndexOf(". ");
  if (sentence > limit * 0.55) return head.slice(0, sentence + 1);
  return `${head.slice(0, head.lastIndexOf(" "))}…`;
}

/** Trim to `limit` at a word boundary, so a title never breaks mid-word. */
export function truncateAtWord(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const head = text.slice(0, limit);
  const cut = head.lastIndexOf(" ");
  return cut > 0 ? head.slice(0, cut) : head;
}

/** Append " · Brand" only when the result still fits the title window. */
export function withBrand(title: string, limit = TITLE_LIMIT): string {
  const full = `${title} · ${SITE_NAME}`;
  return full.length <= limit ? full : title;
}

export type Faq = { q: string; a: string };

/** General FAQs — surfaced on the home page and /faq with FAQPage schema. */
export const GENERAL_FAQS: Faq[] = [
  {
    q: "How much does ReceiptExpenses cost?",
    a: PRICING_FACT,
  },
  {
    q: "Is my data private?",
    a: "Completely. ReceiptExpenses runs entirely in your browser — your business details, logo and receipts are never uploaded to a server. Logos are stored locally as data URLs.",
  },
  {
    q: "What receipt formats can I download?",
    a: "You can export a pixel-perfect PDF or PNG of exactly what you see in the live preview, and you can print directly from your browser.",
  },
  {
    q: "Can I add my own logo and currency?",
    a: "Yes. Upload a logo, pick from many currencies formatted correctly for each region, set your tax rate, and adjust the accent colour and font size.",
  },
  {
    q: "What can I use the receipts for?",
    a: "ReceiptExpenses is for generating receipts for your own business, freelancing or personal record-keeping — for example reconstructing a lost receipt of a real purchase. Templates are generic and brandable; please don't impersonate real named retailers.",
  },
  {
    q: "Do I need an account?",
    a: "You can build and preview a receipt without an account. To download, print or save it you'll create a free account — sign up with your email or continue with Google in one click.",
  },
];

/**
 * Build FAQs for a specific receipt type, blending type-specific + general.
 * For brand-styled templates pass `brandLabel` — it adds an explicit
 * "is this official?" disambiguation Q&A so search/answer engines understand
 * these are independent templates, not official brand outlets.
 */
export function faqsForType(name: string, keyword: string, brandLabel?: string): Faq[] {
  const brandFaq: Faq[] = brandLabel
    ? [
        {
          q: `Is this an official ${brandLabel} receipt?`,
          a: `No. ReceiptExpenses is not affiliated with ${brandLabel}. This is an independent, customizable ${keyword} template styled after that receipt format — intended for reconstructing a lost receipt of a real purchase you made, or for your own expense records. Don't use it to impersonate ${brandLabel} or deceive anyone.`,
        },
      ]
    : [];
  return [
    {
      q: `How do I make a ${keyword} online?`,
      a: `Pick the ${name} template in the ReceiptExpenses receipt generator, fill in your business details and line items in the form on the left, and watch the receipt build live on the right. When it looks right, download it as a PDF or PNG.`,
    },
    {
      q: `How much does the ${keyword} maker cost?`,
      a: PAYMENTS_ENABLED
        ? `Building and previewing a ${keyword} is free. Downloading it as a PDF or PNG, printing or saving it requires a Pro subscription ($6/month, cancel anytime).`
        : `It's free. Building and previewing a ${keyword} needs no account; downloading it as a PDF or PNG, printing or saving it just requires a free account (sign up with email or Google).`,
    },
    ...brandFaq,
    {
      q: `Can I customise the ${keyword} template?`,
      a: `Absolutely. Add your logo, change the currency and tax rate, toggle tax/tip/signature lines, and adjust the accent colour and font size.`,
    },
    ...GENERAL_FAQS.slice(0, 3),
  ];
}

// --- JSON-LD builders (single source of truth for structured data) ---

/**
 * Offer that always matches the live pricing model. Keying this off
 * PAYMENTS_ENABLED means structured data can never contradict page copy —
 * a mismatch there makes answer engines distrust or misquote the site.
 */
export function offerJsonLd(): Record<string, unknown> {
  return PAYMENTS_ENABLED
    ? {
        "@type": "Offer",
        price: "6.00",
        priceCurrency: "USD",
        category: "subscription",
        description: "Pro subscription: unlimited PDF/PNG downloads, printing and saved receipts.",
      }
    : {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description:
          "Free: build and preview without an account; a free account unlocks PDF/PNG download, print and save.",
      };
}

/** Organization schema — shared across pages. */
export function orgJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    email: "support@receiptexpenses.com",
    description: SITE_DEFINITION,
    foundingDate: SITE_PUBLISHED_ISO,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@receiptexpenses.com",
      url: `${SITE_URL}/contact`,
      availableLanguage: "English",
    },
    // NOTE: `sameAs` is deliberately absent until there are real profiles to
    // point at. Answer engines use it to corroborate that the entity exists, so
    // adding verified social/directory URLs here is a genuine GEO win — but
    // listing URLs that do not exist is worse than listing none.
  };
}

/**
 * WebSite schema — the sitewide entity node that ties the whole domain together
 * for search/answer engines. Emitted once on the home page. No SearchAction:
 * the site has no server-side search endpoint, and declaring one that doesn't
 * exist is a validation/trust risk, so it's intentionally omitted.
 */
export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: "Receipt Expenses",
    url: SITE_URL,
    description: SITE_DEFINITION,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * WebPage node carrying explicit freshness dates.
 *
 * Crawlers and answer engines look for datePublished/dateModified to judge how
 * current a page is; a page that emits neither reads as undated, which costs it
 * in "best/latest X" style answers. Static marketing pages have no natural date,
 * so they inherit the site-wide review date.
 */
export function webPageJsonLd(opts: {
  url: string;
  name: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  primaryImage?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    datePublished: opts.datePublished ?? SITE_PUBLISHED_ISO,
    dateModified: opts.dateModified ?? LAST_UPDATED_ISO,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    ...(opts.primaryImage
      ? { primaryImageOfPage: { "@type": "ImageObject", url: opts.primaryImage } }
      : {}),
  };
}

/**
 * HowTo schema from ordered steps. Only emit this where the numbered steps are
 * genuinely present on the page as an ordered sequence — Google requires the
 * on-page content to match the markup.
 */
export function howToJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  steps: { name: string; text: string }[];
  totalTime?: string; // ISO 8601 duration, e.g. "PT2M"
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    ...(opts.totalTime ? { totalTime: opts.totalTime } : {}),
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${opts.url}#step-${i + 1}`,
    })),
  };
}

/**
 * Article schema for cornerstone guide pages. `author`/`publisher` point at the
 * real Organization; never fabricate a person byline. `dateModified` drives the
 * "freshness" signal answer engines weigh, so keep it in sync with LAST_UPDATED.
 */
export function articleJsonLd(opts: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    inLanguage: "en",
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
    },
  };
}

/** BreadcrumbList from an ordered list of {name, path} crumbs (path is relative). */
export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

/**
 * SoftwareApplication schema for the app (home page) or a specific template
 * landing page. `operatingSystem: "Web browser"` + BusinessApplication follow
 * Google's guidance for browser-based tools.
 */
export function softwareAppJsonLd(opts?: {
  name?: string;
  description?: string;
  url?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: opts?.name ?? SITE_NAME,
    url: opts?.url ?? SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    description: opts?.description ?? SITE_DEFINITION,
    offers: offerJsonLd(),
    featureList: [
      "24+ receipt templates across Business, Retail, Food & Drink, Travel and Services",
      "Real-time live preview",
      "Pixel-perfect PDF and PNG export",
      "Print from the browser",
      "Custom logo, currency, tax and tip",
      "100% client-side — receipt data never uploaded",
    ],
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

/** FAQPage schema from a list of FAQs. */
export function faqJsonLd(faqs: Faq[], url?: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { url } : {}),
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
