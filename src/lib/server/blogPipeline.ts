import { countWords, faqsFromBody, type Block, type FaqItem, type InternalLink } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { BlogSettings } from "./blogSettings";
import type { NewBlogPost, PostLite } from "./blogStore";
import { resolveCoverImage } from "./blogImages";

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

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
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

export async function outline(complete: Completer, keyword: string): Promise<Outline> {
  const system =
    `You are an SEO content strategist for ${AUDIENCE} ` +
    `Return a plan in EXACTLY this plain-text format and nothing else:\n` +
    `INTENT: <one line>\nANGLE: <one line unique angle>\nHEADINGS:\n- <H2>\n- <H2>\n- <H2>\n- <H2>\n` +
    `SECONDARY: kw1, kw2, kw3\nFAQ:\n- <question?>\n- <question?>\n- <question?>`;
  let text = "";
  try {
    text = await complete(system, `Keyword: ${keyword}`, 600);
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
    `- First line: the H1 title in plain text (no '#').\n` +
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
  return complete(system, user, 2048);
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
    const edited = await complete(system, markdown, 2048);
    // Guard against a model that returns a refusal or a tiny fragment.
    return edited.split("\n").length >= 6 && edited.length > markdown.length * 0.5 ? edited : markdown;
  } catch {
    return markdown;
  }
}

// --- Meta + schema ---------------------------------------------------------

function buildMeta(title: string, firstPara: string, keyword: string): { metaTitle: string; metaDescription: string } {
  const base = title.length <= 60 ? title : `${title.slice(0, 57).trimEnd()}…`;
  const metaTitle = base.length <= 60 ? base : base.slice(0, 60);
  let desc = firstPara.replace(/\s+/g, " ").trim();
  if (!new RegExp(keyword.split(/\s+/)[0]!, "i").test(desc)) desc = `${keyword} — ${desc}`;
  const metaDescription = desc.length <= 158 ? desc : `${desc.slice(0, 155).trimEnd()}…`;
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

  // Guardrail: quality floor.
  const words = countWords(blocks);
  if (words < settings.minWordCount) {
    return { ok: false, reason: `Below quality floor (${words} words < ${settings.minWordCount}).` };
  }

  const firstPara = (blocks.find((b) => b.type === "p") as { text: string } | undefined)?.text ?? "";
  const { metaTitle, metaDescription } = buildMeta(title, firstPara, kw);
  const excerpt = metaDescription;

  // Slug (unique against existing).
  let slug = slugify(title) || slugify(kw) || `post-${Date.now()}`;
  let n = 2;
  while (validSlugs.has(slug)) slug = `${slugify(title) || slugify(kw)}-${n++}`;

  // Optional cover image (disabled until a provider is configured — returns null).
  const cover = await resolveCoverImage(kw, title);

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
      status: settings.autoPublish ? "published" : "draft",
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
