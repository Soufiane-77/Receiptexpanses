import { PAYMENTS_ENABLED } from "./features";

/** Central SEO constants and content. Update SITE_URL before deploying. */
export const SITE_URL = "https://receiptexpenses.com";
export const SITE_NAME = "ReceiptExpenses";

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
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    email: "support@receiptexpenses.com",
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
