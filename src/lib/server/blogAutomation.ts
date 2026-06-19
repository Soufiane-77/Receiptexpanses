import { countWords, type Block } from "@/lib/blog";
import { insertPost, slugExists, type NewBlogPost } from "./blogStore";

/**
 * Server-side blog automation. The admin panel writes a config (keywords +
 * cadence) into D1; the cron `scheduled()` handler — or the /api/cron/run
 * fallback — calls runDueAutomation() on a schedule. When a post is due, it
 * generates a real article with Workers AI and inserts it into blog_posts.
 *
 * Everything runs on the free tier: Workers AI for generation, D1 for storage,
 * Cron Triggers for the schedule. No external API keys.
 */

const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

export type AutomationConfig = {
  keywords: string[];
  intervalHours: number;
  author: string;
  cover: string;
  running: boolean;
  cursor: number;
  lastRunAt: number | null;
  lastKeyword: string | null;
};

type ConfigRow = {
  keywords: string;
  interval_hours: number;
  author: string;
  cover: string;
  running: number;
  cursor: number;
  last_run_at: number | null;
  last_keyword: string | null;
};

export async function loadAutomation(db: D1Database): Promise<AutomationConfig> {
  const row = await db
    .prepare("SELECT * FROM blog_automation WHERE id = 1")
    .first<ConfigRow>();
  let keywords: string[] = [];
  try {
    keywords = row ? (JSON.parse(row.keywords) as string[]) : [];
  } catch {
    keywords = [];
  }
  return {
    keywords,
    intervalHours: row?.interval_hours ?? 24,
    author: row?.author ?? "The ReceiptExpenses Team",
    cover: row?.cover ?? "📝",
    running: (row?.running ?? 0) === 1,
    cursor: row?.cursor ?? 0,
    lastRunAt: row?.last_run_at ?? null,
    lastKeyword: row?.last_keyword ?? null,
  };
}

export type AutomationPatch = {
  keywords?: string[];
  intervalHours?: number;
  author?: string;
  cover?: string;
  running?: boolean;
};

export async function saveAutomation(db: D1Database, patch: AutomationPatch): Promise<AutomationConfig> {
  const current = await loadAutomation(db);
  const next: AutomationConfig = {
    ...current,
    ...patch,
    keywords: patch.keywords ?? current.keywords,
  };
  await db
    .prepare(
      `UPDATE blog_automation
         SET keywords = ?, interval_hours = ?, author = ?, cover = ?, running = ?, updated_at = ?
       WHERE id = 1`
    )
    .bind(
      JSON.stringify(next.keywords),
      Math.max(1, next.intervalHours),
      next.author,
      next.cover,
      next.running ? 1 : 0,
      Date.now()
    )
    .run();
  return loadAutomation(db);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function estimateReadMins(body: Block[]): number {
  return Math.max(1, Math.round(countWords(body) / 200));
}

/** Deterministic, AI-free article — used as a fallback if Workers AI fails. */
function templateArticle(keyword: string): { title: string; excerpt: string; body: Block[] } {
  const k = keyword.trim();
  return {
    title: `${titleCase(k)}: a quick, practical guide`,
    excerpt: `Everything you need to know about ${k.toLowerCase()} — what to include, common mistakes, and how to make one in under a minute.`,
    body: [
      { type: "p", text: `Whether you run a small business or just need to keep clean records, knowing how to handle a ${k.toLowerCase()} saves time and avoids confusion at tax time.` },
      { type: "h2", text: "What to include" },
      {
        type: "ul",
        items: [
          "Your business name, address and contact details",
          "A unique receipt number and the date/time",
          "An itemized list with quantity and unit price",
          "Subtotal, tax (with the rate) and a clearly marked total",
          "The payment method used",
        ],
      },
      { type: "h2", text: "Common mistakes to avoid" },
      {
        type: "ul",
        items: [
          "Skipping the receipt number — it makes records hard to reconcile",
          "Rounding inconsistently — let the tool do the math",
          "Forgetting the tax line when it applies",
        ],
      },
      { type: "h2", text: `Make a ${k.toLowerCase()} with ReceiptExpenses` },
      { type: "p", text: "Pick a template, fill in your business and items, and watch the receipt build live. When it looks right, download a PDF or PNG — everything runs in your browser, so nothing is uploaded." },
    ],
  };
}

/**
 * Parse a markdown article into our Block[] model. Small instruction-tuned
 * models produce clean markdown far more reliably than strict JSON, so we ask
 * for markdown and parse it here.
 *   - `#`/`##`/`###` headings  → h2
 *   - `- `/`* `/`1. ` items     → grouped into a ul
 *   - other non-empty lines     → paragraphs (bold/`#` markers stripped)
 */
function markdownToBlocks(md: string): Block[] {
  const blocks: Block[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push({ type: "ul", items: bullets });
      bullets = [];
    }
  };
  const clean = (s: string) => s.replace(/\*\*/g, "").replace(/`/g, "").trim();
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (/^#{1,4}\s+/.test(line)) {
      flush();
      blocks.push({ type: "h2", text: clean(line.replace(/^#{1,4}\s+/, "")) });
    } else if (/^([-*]|\d+\.)\s+/.test(line)) {
      bullets.push(clean(line.replace(/^([-*]|\d+\.)\s+/, "")));
    } else {
      flush();
      blocks.push({ type: "p", text: clean(line) });
    }
  }
  flush();
  return blocks;
}

/**
 * Generate an article with Workers AI as markdown, then parse it. Falls back to
 * a deterministic template if the model errors or returns too little usable
 * content. Logs failures so they're visible via `wrangler tail`.
 */
async function generateArticle(
  ai: Ai,
  keyword: string
): Promise<{ title: string; excerpt: string; body: Block[] }> {
  const fallback = templateArticle(keyword);
  try {
    const system =
      "You are a content writer for ReceiptExpenses, an online receipt generator for small businesses and freelancers. " +
      "Write a genuinely useful, original ~400-word blog article for the user's keyword. " +
      "Do NOT impersonate or replicate any real named company. " +
      "Format: the FIRST line is the article title in plain text (no '#'). Then the body in GitHub markdown, " +
      "using '## ' for 2-3 subheadings and '- ' for bullet lists. Keep paragraphs short. " +
      "End with a short paragraph noting ReceiptExpenses can create this receipt in under a minute.";
    const res = (await ai.run(MODEL, {
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Keyword: ${keyword}` },
      ],
      max_tokens: 1024,
    })) as { response?: string };

    const text = (res?.response ?? "").trim();
    if (!text) {
      console.warn("[blog-automation] empty AI response, using template fallback");
      return fallback;
    }

    const lines = text.split("\n");
    const titleLine = (lines.shift() ?? "").replace(/^#{1,4}\s+/, "").replace(/\*\*/g, "").trim();
    const body = markdownToBlocks(lines.join("\n"));
    if (body.length < 2) {
      console.warn("[blog-automation] AI output too short, using template fallback");
      return fallback;
    }
    const firstPara = body.find((b) => b.type === "p") as { text: string } | undefined;
    return {
      title: titleLine || fallback.title,
      excerpt: firstPara ? `${firstPara.text.slice(0, 180)}${firstPara.text.length > 180 ? "…" : ""}` : fallback.excerpt,
      body,
    };
  } catch (err) {
    console.error("[blog-automation] AI generation failed:", err);
    return fallback;
  }
}

export type RunResult = {
  published: boolean;
  reason: string;
  slug?: string;
};

/**
 * Publish at most one post if the schedule says one is due. Idempotent enough
 * to be called on a frequent cron — it no-ops unless `running` and the
 * interval has elapsed. `force` (manual "Generate now") skips the interval check.
 */
export async function runDueAutomation(
  env: { DB: D1Database; AI: Ai },
  opts: { force?: boolean } = {}
): Promise<RunResult> {
  const db = env.DB;
  const cfg = await loadAutomation(db);

  if (!opts.force && !cfg.running) return { published: false, reason: "Scheduler is paused." };
  if (cfg.keywords.length === 0) return { published: false, reason: "No keywords configured." };

  if (!opts.force && cfg.lastRunAt) {
    const elapsedHours = (Date.now() - cfg.lastRunAt) / 3_600_000;
    if (elapsedHours < cfg.intervalHours) {
      return {
        published: false,
        reason: `Not due yet (${(cfg.intervalHours - elapsedHours).toFixed(1)}h remaining).`,
      };
    }
  }

  const keyword = cfg.keywords[cfg.cursor % cfg.keywords.length]!;
  const article = await generateArticle(env.AI, keyword);

  // Ensure a unique slug.
  let slug = slugify(article.title) || slugify(keyword) || `post-${Date.now()}`;
  let n = 2;
  while (await slugExists(db, slug)) {
    slug = `${slugify(article.title) || slugify(keyword)}-${n++}`;
  }

  const post: NewBlogPost = {
    slug,
    title: article.title,
    excerpt: article.excerpt,
    author: cfg.author,
    cover: cfg.cover,
    body: article.body,
    readMins: estimateReadMins(article.body),
    status: "published",
    source: "auto",
    keyword,
  };
  await insertPost(db, post);

  await db
    .prepare(
      "UPDATE blog_automation SET cursor = ?, last_run_at = ?, last_keyword = ? WHERE id = 1"
    )
    .bind((cfg.cursor + 1) % cfg.keywords.length, Date.now(), keyword)
    .run();

  return { published: true, reason: `Published "${article.title}".`, slug };
}
