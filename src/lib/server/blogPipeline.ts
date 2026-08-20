import { countWords, faqsFromBody, type Block, type FaqItem, type InternalLink } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { BlogSettings } from "./blogSettings";
import type { NewBlogPost, PostLite } from "./blogStore";
import { resolveCoverImages, type CoverImage } from "./blogImages";

/**
 * Content generation pipeline for the Autopilot Blog engine. Stages are
 * deliberately separate so each is testable:
 *   1. outline   — search intent, angle, H2s, secondary keywords, FAQ questions
 *   2. draft     — full markdown article in the brand voice
 *   3. selfEdit  — tighten, de-dupe, ensure keyword placement
 *   4. assemble  — parse to Block[], inject internal links + CTA + FAQ, build
 *                  meta + JSON-LD, compute slug / reading time / word count
 *
 * The model is reached through a `Completer` so the engine can swap Workers AI
 * for the Anthropic API later without touching pipeline logic.
 */

// --- Generator seam --------------------------------------------------------

export type Completer = (system: string, user: string, maxTokens: number) => Promise<string>;

/** Workers AI completer (free tier). Throws on transport errors. */
export function workersAiCompleter(ai: Ai, model: string): Completer {
  return async (system, user, maxTokens) => {
    const res = (await ai.run(model as never, {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: maxTokens,
    } as never)) as { response?: string };
    return (res?.response ?? "").trim();
  };
}

// --- Text helpers ----------------------------------------------------------

/**
 * URL-safe slug. Truncates on a word boundary so a long title never yields a
 * slug ending mid-word (e.g. "...accounting-with-re"), which looks broken in
 * search results and in shared links.
 */
export function slugify(s: string, max = 70): string {
  const base = s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base.length <= max) return base;
  const cut = base.slice(0, max);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/, "");
}

/** Trim to `max` chars without cutting a word in half. */
function truncateAtWord(s: string, max: number): string {
  const clean = s.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const i = cut.lastIndexOf(" ");
  return (i > max * 0.6 ? cut.slice(0, i) : cut).replace(/[\s,;:.-]+$/, "");
}


function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

/** Normalize a title: strip leading '#', quotes, trailing punctuation. */
function cleanTitle(s: string): string {
  return stripMd(s.replace(/^#{1,6}\s+/, "").replace(/^["']|["']$/g, "")).slice(0, 110);
}

// --- Markdown -> Block[] ---------------------------------------------------

/**
 * Parse GitHub-flavoured markdown into our Block[] model. Handles headings
 * (## -> h2, ### -> h3), ordered/unordered lists, and pipe tables. Inline
 * markdown links and bold are preserved in the text (rendered by <PostBody>).
 */
export function markdownToBlocks(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let bullets: string[] = [];
  let ordered: string[] = [];

  const flush = () => {
    if (bullets.length) {
      blocks.push({ type: "ul", items: bullets });
      bullets = [];
    }
    if (ordered.length) {
      blocks.push({ type: "ol", items: ordered });
      ordered = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) {
      flush();
      continue;
    }
    // Table: a header row `| a | b |` followed by a separator `| --- | --- |`.
    if (/^\|.*\|$/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1]!.trim())) {
      flush();
      const headers = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && /^\|.*\|$/.test(lines[i]!.trim())) {
        rows.push(splitRow(lines[i]!.trim()));
        i++;
      }
      i--;
      blocks.push({ type: "table", headers, rows });
      continue;
    }
    if (/^#{1,2}\s+/.test(line)) {
      flush();
      blocks.push({ type: "h2", text: cleanTitle(line) });
    } else if (/^#{3,6}\s+/.test(line)) {
      flush();
      blocks.push({ type: "h3", text: cleanTitle(line) });
    } else if (/^\d+\.\s+/.test(line)) {
      if (bullets.length) flush();
      ordered.push(stripMd(line.replace(/^\d+\.\s+/, "")));
    } else if (/^[-*]\s+/.test(line)) {
      if (ordered.length) flush();
      bullets.push(stripMd(line.replace(/^[-*]\s+/, "")));
    } else {
      flush();
      blocks.push({ type: "p", text: stripMd(line) });
    }
  }
  flush();
  return blocks;
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => stripMd(c));
}

/**
 * Fold a trailing "FAQ" section into a single `faq` block. Detects a heading
 * whose text mentions FAQ / "frequently asked", then pairs each following h3
 * (the question) with the next paragraph (the answer).
 */
export function extractFaq(blocks: Block[]): Block[] {
  const idx = blocks.findIndex(
    (b) => (b.type === "h2" || b.type === "h3") && /faq|frequently asked/i.test(b.text)
  );
  if (idx === -1) return blocks;

  const before = blocks.slice(0, idx);
  const rest = blocks.slice(idx + 1);
  const items: FaqItem[] = [];
  for (let i = 0; i < rest.length; i++) {
    const b = rest[i]!;
    if (b.type === "h3" || b.type === "h2") {
      const ans = rest[i + 1];
      if (ans && ans.type === "p") {
        items.push({ q: b.text.replace(/\?*$/, "?"), a: ans.text });
        i++;
      } else {
        items.push({ q: b.text.replace(/\?*$/, "?"), a: "" });
      }
    }
  }
  if (items.length === 0) return blocks;
  return [...before, { type: "h2", text: "Frequently asked questions" }, { type: "faq", items: items.filter((i) => i.a) }];
}

// --- Internal links --------------------------------------------------------

const STOPWORDS = new Set(["the", "a", "an", "to", "for", "of", "and", "or", "in", "on", "how", "your", "with", "make", "create"]);

function topicTokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n;
}

/** Pick the most topically-related existing published posts (never invents URLs). */
export function pickRelated(keyword: string, posts: PostLite[], max: number): InternalLink[] {
  const target = topicTokens(keyword);
  return posts
    .filter((p) => p.status === "published")
    .map((p) => ({ p, score: overlapScore(target, topicTokens(`${p.title} ${p.keyword ?? ""}`)) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => ({ slug: x.p.slug, anchor: x.p.title }));
}

/**
 * Inject internal links into the body: linkify the first natural mention of a
 * related post in a paragraph, then append a "Related articles" list. Returns
 * the augmented blocks and the links actually used.
 */
function injectInternalLinks(
  blocks: Block[],
  related: InternalLink[]
): { blocks: Block[]; used: InternalLink[] } {
  if (related.length === 0) return { blocks, used: [] };
  const out = [...blocks];
  const used: InternalLink[] = [];

  for (const link of related) {
    const anchorWords = topicTokens(link.anchor);
    for (let i = 0; i < out.length; i++) {
      const b = out[i]!;
      if (b.type !== "p" || /\]\(/.test(b.text)) continue; // skip paragraphs that already contain a link
      // Find a phrase in the paragraph that overlaps the post topic.
      const phrase = [...anchorWords].find((w) => new RegExp(`\\b${w}\\b`, "i").test(b.text));
      if (!phrase) continue;
      out[i] = { type: "p", text: b.text.replace(new RegExp(`\\b(${phrase})\\b`, "i"), `[$1](/blogs/${link.slug})`) };
      used.push(link);
      break;
    }
  }
  // Always append a Related articles block for the matches we found.
  out.push({ type: "h2", text: "Related articles" });
  out.push({ type: "ul", items: related.map((l) => `[${l.anchor}](/blogs/${l.slug})`) });
  for (const l of related) if (!used.some((u) => u.slug === l.slug)) used.push(l);
  return { blocks: out, used };
}

/** Drop any internal /blogs/<slug> link whose slug doesn't exist (never invent URLs). */
function sanitizeLinks(blocks: Block[], validSlugs: Set<string>): Block[] {
  const fix = (text: string) =>
    text.replace(/\[([^\]]+)\]\((\/blogs\/[a-z0-9-]+)\)/gi, (m, label: string, href: string) => {
      const slug = href.replace("/blogs/", "");
      return validSlugs.has(slug) ? m : label;
    });
  return blocks.map((b) => {
    if (b.type === "p" || b.type === "h2" || b.type === "h3") return { ...b, text: fix(b.text) };
    if (b.type === "ul" || b.type === "ol") return { ...b, items: b.items.map(fix) };
    return b;
  });
}

// --- Stages ----------------------------------------------------------------

export type Outline = {
  intent: string;
  angle: string;
  headings: string[];
  secondary: string[];
  faqs: string[];
};

const AUDIENCE =
  `ReceiptExpenses (${SITE_NAME}) is an online receipt generator for small businesses and freelancers. ` +
  `Users pick a template, fill a live form, and download a PDF/PNG. Never impersonate a real named company.`;

// --- Fraud-adjacent keyword handling ---------------------------------------

/**
 * Keywords whose raw search intent is fabricating a receipt to deceive someone
 * ("fake receipt", "forge a receipt"). These are high-volume and worth ranking
 * for, but the article has to serve the legitimate need behind the query rather
 * than teach fraud — see SAFETY_DIRECTIVE.
 */
const FRAUD_INTENT_RE = /\bfakes?\b|\bforge|\bfraud|\bcounterfeit/i;

export function isSensitiveKeyword(keyword: string): boolean {
  return FRAUD_INTENT_RE.test(keyword);
}

/**
 * Appended to every prompt for a fraud-adjacent keyword. The page still targets
 * the query — that is the whole point of ranking for it — but it answers what
 * people overwhelmingly actually need (a lost/faded receipt for a real purchase,
 * a template for their own business, a prop) and states the legal line plainly.
 * Ranking for the term and giving a lawful answer is both better business and
 * better for the reader than ceding it to sites that do teach forgery.
 */
const SAFETY_DIRECTIVE =
  `\n\nCRITICAL CONTENT RULE for this keyword:\n` +
  `- Do NOT explain how to fabricate a receipt for a purchase that did not happen, and do NOT ` +
  `present forged receipts as acceptable or give tips for making one look convincing to a ` +
  `retailer, employer or tax authority.\n` +
  `- DO address what readers searching this actually need: reconstructing a receipt for a REAL ` +
  `purchase whose original was lost, faded or never issued; creating receipts for their own ` +
  `business; or a harmless prop/meme.\n` +
  `- State plainly, once and without lecturing, that creating a receipt for a transaction that ` +
  `never occurred — to claim a refund, expense, reimbursement or tax deduction — is fraud and ` +
  `illegal in most jurisdictions.\n` +
  `- Keep the tone helpful, practical and non-judgemental. No moralising, no repeated warnings.`;

function safetyFor(keyword: string): string {
  return isSensitiveKeyword(keyword) ? SAFETY_DIRECTIVE : "";
}

export async function outline(complete: Completer, keyword: string): Promise<Outline> {
  const system =
    `You are an SEO content strategist for ${AUDIENCE} ` +
    `Return a plan in EXACTLY this plain-text format and nothing else:\n` +
    `INTENT: <one line>\nANGLE: <one line unique angle>\nHEADINGS:\n- <H2>\n- <H2>\n- <H2>\n- <H2>\n` +
    `SECONDARY: kw1, kw2, kw3\nFAQ:\n- <question?>\n- <question?>\n- <question?>`;
  const system2 = system + safetyFor(keyword);
  let text = "";
  try {
    text = await complete(system2, `Keyword: ${keyword}`, 600);
  } catch {
    text = "";
  }
  return parseOutline(text);
}

function parseOutline(text: string): Outline {
  const get = (re: RegExp) => (text.match(re)?.[1] ?? "").trim();
  const list = (label: string) => {
    const m = text.match(new RegExp(`${label}:\\s*([\\s\\S]*?)(?:\\n[A-Z]+:|$)`, "i"));
    if (!m) return [];
    return m[1]!
      .split("\n")
      .map((l) => l.replace(/^[-*]\s+/, "").trim())
      .filter(Boolean);
  };
  return {
    intent: get(/INTENT:\s*(.+)/i),
    angle: get(/ANGLE:\s*(.+)/i),
    headings: list("HEADINGS"),
    secondary: (get(/SECONDARY:\s*(.+)/i) || "").split(",").map((s) => s.trim()).filter(Boolean),
    faqs: list("FAQ"),
  };
}

export async function draft(
  complete: Completer,
  keyword: string,
  plan: Outline,
  settings: BlogSettings,
  related: PostLite[]
): Promise<string> {
  const linkList = related
    .slice(0, 6)
    .map((p) => `- [${p.title}](/blogs/${p.slug})`)
    .join("\n");
  const system =
    `You are an expert writer for ${AUDIENCE}\n` +
    `Voice: ${settings.brandVoice}\n` +
    `Write an original, genuinely useful 1200-1700 word article in GitHub markdown. Requirements:\n` +
    `- First line: the H1 title in plain text (no '#'), MAX 60 characters so search results do not truncate it.\n` +
    `- Open with 2-3 sentences that directly answer the query (quotable on its own).\n` +
    `- A "## Key takeaways" bullet list near the top.\n` +
    `- 4-6 "## " sections with logical "### " subsections; use clear, declarative, fact-dense sentences.\n` +
    `- At least one comparison table (markdown pipe table) or numbered step list where it fits.\n` +
    `- Define key terms explicitly. No fluff, no keyword stuffing.\n` +
    `- End with a "## FAQ" section: each question as "### " followed by a 1-2 sentence answer.\n` +
    (linkList ? `- Where natural, link to 2-3 of these existing articles using markdown links:\n${linkList}\n` : "") +
    `- Use the target keyword in the title, first paragraph and one heading (naturally).`;
  const user =
    `Target keyword: ${keyword}\n` +
    (plan.intent ? `Search intent: ${plan.intent}\n` : "") +
    (plan.angle ? `Angle: ${plan.angle}\n` : "") +
    (plan.headings.length ? `Suggested H2s:\n${plan.headings.map((h) => `- ${h}`).join("\n")}\n` : "") +
    (plan.faqs.length ? `FAQ questions to answer:\n${plan.faqs.map((f) => `- ${f}`).join("\n")}` : "");
  return complete(system + safetyFor(keyword), user, 4096);
}

export async function selfEdit(
  complete: Completer,
  keyword: string,
  markdown: string,
  settings: BlogSettings
): Promise<string> {
  const system =
    `You are a meticulous editor. Tighten the article: remove repetition and fluff, fix tone to "${settings.brandVoice}", ` +
    `keep all markdown structure (title first line, ## / ### headings, tables, lists, FAQ), and make sure the keyword "${keyword}" ` +
    `appears naturally in the title, first paragraph and one heading. Return ONLY the edited markdown article, same format.`;
  try {
    const edited = await complete(system + safetyFor(keyword), markdown, 4096);
    // Guard against a model that returns a refusal or a tiny fragment.
    return edited.split("\n").length >= 6 && edited.length > markdown.length * 0.5 ? edited : markdown;
  } catch {
    return markdown;
  }
}

/**
 * Expand a draft that came in under the quality floor.
 *
 * The 8B model frequently returns ~500 words even when asked for 1200+. Rather
 * than discard the work (which stranded keywords as `failed`), ask it to deepen
 * the existing article with concrete, non-repetitive material and keep the
 * focus keyword intact. Returns the longer of the two so a bad expansion can
 * never make things worse.
 */
export async function expand(
  complete: Completer,
  keyword: string,
  markdown: string,
  targetWords: number
): Promise<string> {
  const system =
    `You are expanding an existing article about "${keyword}" so it fully covers the topic.\n` +
    `Return the COMPLETE rewritten article in the same markdown format (title on the first line, ` +
    `"## " sections, "### " subsections, tables, lists, a "## FAQ" section with "### " questions).\n` +
    `Requirements:\n` +
    `- Target at least ${targetWords} words — noticeably longer than the input.\n` +
    `- Keep every existing section; deepen them with specifics: worked examples, concrete numbers, ` +
    `edge cases, step-by-step detail, and a comparison table if one fits.\n` +
    `- Add 2-3 genuinely new "## " sections that a reader searching "${keyword}" would want.\n` +
    `- Add 2 more FAQ entries.\n` +
    `- Keep "${keyword}" in the title, the first paragraph and at least one heading.\n` +
    `- Do NOT pad with repetition, filler or restated sentences. Every added sentence must carry information.`;
  try {
    const out = await complete(system + safetyFor(keyword), markdown, 4096);
    return out.trim().length > markdown.trim().length ? out : markdown;
  } catch {
    return markdown;
  }
}


/**
 * Spread images through the article, each placed just before an h2 so it
 * introduces a section rather than interrupting a paragraph. Skips the first
 * heading (the cover already sits above it) and spaces them evenly.
 */
export function insertBodyImagesInto(blocks: Block[], images: CoverImage[]): Block[] {
  const headingIdx = blocks
    .map((b, i) => (b.type === "h2" ? i : -1))
    .filter((i) => i > 0);
  if (headingIdx.length === 0 || images.length === 0) return blocks;

  // Pick evenly spaced headings, skipping the very first section.
  const chosen: number[] = [];
  const step = Math.max(1, Math.floor(headingIdx.length / (images.length + 1)));
  for (let n = 1; n <= images.length; n++) {
    const at = headingIdx[Math.min(n * step, headingIdx.length - 1)];
    if (at !== undefined && !chosen.includes(at)) chosen.push(at);
  }

  // Splice from the end so earlier indices stay valid.
  const out = [...blocks];
  chosen
    .map((idx, n) => ({ idx, img: images[n]! }))
    .filter((x) => x.img)
    .sort((a, b) => b.idx - a.idx)
    .forEach(({ idx, img }) => {
      out.splice(idx, 0, {
        type: "image",
        src: img.url,
        alt: img.alt,
        ...(img.credit ? { caption: img.credit } : {}),
      });
    });
  return out;
}
// --- Meta + schema ---------------------------------------------------------

function buildMeta(title: string, firstPara: string, keyword: string): { metaTitle: string; metaDescription: string } {
  // Cut on word boundaries: a title ending "…Accounting with Re…" reads as
  // broken in a SERP snippet and in social cards.
  const metaTitle = truncateAtWord(title, 60);
  let desc = firstPara.replace(/\s+/g, " ").trim();
  if (!new RegExp(keyword.split(/\s+/)[0]!, "i").test(desc)) desc = `${keyword} — ${desc}`;
  const metaDescription = truncateAtWord(desc, 155);
  return { metaTitle, metaDescription };
}

function buildSchema(
  slug: string,
  title: string,
  metaDescription: string,
  author: string,
  date: string,
  faqs: FaqItem[],
  coverImageUrl?: string
): string {
  const url = `${SITE_URL}/blogs/${slug}`;
  const graph: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: metaDescription,
      datePublished: date,
      dateModified: date,
      author: { "@type": "Organization", name: author },
      publisher: { "@type": "Organization", name: SITE_NAME },
      mainEntityOfPage: url,
      ...(coverImageUrl ? { image: coverImageUrl } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blogs` },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ],
    },
  ];
  if (faqs.length) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return JSON.stringify(graph);
}

// --- Orchestrator ----------------------------------------------------------

export type GenerateResult =
  | { ok: true; post: NewBlogPost }
  | { ok: false; reason: string };

export async function generatePost(
  env: { AI: Ai },
  keyword: string,
  settings: BlogSettings,
  existingPosts: PostLite[]
): Promise<GenerateResult> {
  const kw = keyword.trim();
  if (!kw) return { ok: false, reason: "Empty keyword." };

  // Duplicate guard: refuse if an existing post already targets this topic strongly.
  const dupe = existingPosts.find(
    (p) => slugify(p.keyword ?? "") === slugify(kw) || overlapStrong(kw, p)
  );
  if (dupe) return { ok: false, reason: `Skipped — too similar to existing post "${dupe.title}".` };

  const complete = workersAiCompleter(env.AI, settings.model);

  let markdown = "";
  try {
    const plan = await outline(complete, kw);
    const related = pickRelated(kw, existingPosts, 6).map((l) => ({
      slug: l.slug,
      title: l.anchor,
      keyword: null,
      status: "published",
    }));
    markdown = await draft(complete, kw, plan, settings, related);
    if (markdown) markdown = await selfEdit(complete, kw, markdown, settings);
  } catch (err) {
    return { ok: false, reason: `Generation failed: ${String((err as Error)?.message ?? err).slice(0, 200)}` };
  }
  if (!markdown.trim()) return { ok: false, reason: "Model returned no content." };

  // Expansion loop. The 8B model routinely returns ~500 words even when asked
  // for 1200+, which used to strand the keyword as `failed`. Deepen the draft
  // instead so every queued keyword yields a usable post.
  for (let attempt = 0; attempt < 2; attempt++) {
    const probe = markdownToBlocks(markdown.split("\n").slice(1).join("\n"));
    if (countWords(probe) >= settings.minWordCount) break;
    markdown = await expand(complete, kw, markdown, Math.max(settings.minWordCount + 300, 900));
  }

  // Title = first non-empty line; body = the rest.
  const all = markdown.split("\n");
  const titleLine = all.shift() ?? "";
  const title = cleanTitle(titleLine) || `${kw}`;

  let blocks = markdownToBlocks(all.join("\n"));
  blocks = extractFaq(blocks);

  // Internal links (validated against real published slugs).
  const validSlugs = new Set(existingPosts.filter((p) => p.status === "published").map((p) => p.slug));
  const related = pickRelated(kw, existingPosts, settings.internalLinkDensity || 3);
  const linked = injectInternalLinks(blocks, related);
  blocks = sanitizeLinks(linked.blocks, validSlugs);

  // CTA block mid-article and at the end.
  const cta: Block = { type: "cta", text: settings.ctaText, url: settings.ctaUrl, label: settings.ctaLabel };
  const mid = Math.max(2, Math.floor(blocks.length / 2));
  blocks = [...blocks.slice(0, mid), cta, ...blocks.slice(mid), cta];

  // Quality floor. After the expansion attempts above, a still-short article is
  // kept as a DRAFT rather than discarded: the keyword is consumed, the work is
  // reviewable in the admin, and thin content never auto-publishes.
  const words = countWords(blocks);
  const belowFloor = words < settings.minWordCount;

  // Fraud-adjacent keywords are written with the safety framing above, but they
  // are never auto-published: a human reads them once before they go live.
  const sensitive = isSensitiveKeyword(kw);

  const firstPara = (blocks.find((b) => b.type === "p") as { text: string } | undefined)?.text ?? "";
  const { metaTitle, metaDescription } = buildMeta(title, firstPara, kw);
  const excerpt = metaDescription;

  // Slug (unique against existing).
  let slug = slugify(title) || slugify(kw) || `post-${Date.now()}`;
  let n = 2;
  while (validSlugs.has(slug)) slug = `${slugify(title) || slugify(kw)}-${n++}`;

  // Cover + in-body images. [0] is the cover; the rest are spread between
  // sections so a long article is not a wall of text.
  const images = await resolveCoverImages(kw, title, 3);
  const cover = images[0] ?? null;
  if (images.length > 1) blocks = insertBodyImagesInto(blocks, images.slice(1));

  const faqs = faqsFromBody(blocks);
  const date = new Date().toISOString().slice(0, 10);
  const schemaJson = buildSchema(slug, title, metaDescription, settings.author, date, faqs, cover?.url);

  return {
    ok: true,
    post: {
      slug,
      title,
      excerpt,
      author: settings.author,
      cover: settings.cover,
      body: blocks,
      readMins: Math.max(1, Math.round(words / 200)),
      status: settings.autoPublish && !belowFloor && !sensitive ? "published" : "draft",
      source: "auto",
      keyword: kw,
      metaTitle,
      metaDescription,
      coverImageUrl: cover?.url,
      coverImageAlt: cover?.alt,
      wordCount: words,
      schemaJson,
      targetKeyword: kw,
      secondaryKeywords: [],
      internalLinks: linked.used,
    },
  };
}

function overlapStrong(keyword: string, p: PostLite): boolean {
  const a = topicTokens(keyword);
  const b = topicTokens(`${p.title} ${p.keyword ?? ""}`);
  if (a.size === 0) return false;
  // Consider it a near-duplicate if most of the keyword's topic words are covered.
  return overlapScore(a, b) >= Math.max(2, Math.ceil(a.size * 0.8));
}
