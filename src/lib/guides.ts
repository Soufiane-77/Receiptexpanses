import type { Block, FaqItem } from "./blog";
import { faqsFromBody } from "./blog";

/**
 * Cornerstone guide pages ("pillar" content) live at /guides/[slug]. They reuse
 * the blog `Block[]` body model so the same server-rendered <PostBody> renders
 * them — every guide is therefore SSR, definition-first, and crawlable with no
 * client JS. Each guide declares a TL;DR, an intent, its HowTo steps (only when
 * the body is genuinely a numbered procedure), and internal links to templates.
 */
export type Guide = {
  slug: string;
  /** H1 / on-page title. */
  title: string;
  /** <title> tag — keep ≤ ~60 chars, question-shaped where possible. */
  metaTitle: string;
  metaDescription: string;
  /** One-sentence, self-contained answer shown as the TL;DR callout and used in schema. */
  tldr: string;
  /** ISO date first published. */
  datePublished: string;
  /** ISO date last reviewed/updated — drives the visible freshness date + Article.dateModified. */
  dateModified: string;
  category: "Guides" | "Comparisons" | "Templates" | "Taxes";
  /** Structured body, rendered by <PostBody>. First block should be the definition-first answer. */
  body: Block[];
  /**
   * HowTo steps — ONLY set when the on-page body contains these as a real ordered
   * sequence, so the HowTo markup matches the visible content (Google requirement).
   */
  howToSteps?: { name: string; text: string }[];
  /** Related guide slugs + template ids for the internal-linking cluster. */
  relatedGuides?: string[];
  relatedTemplates?: string[];
};

/** FAQ pairs harvested from any `faq` blocks in a guide body (for FAQPage schema). */
export function guideFaqs(g: Guide): FaqItem[] {
  return faqsFromBody(g.body);
}
