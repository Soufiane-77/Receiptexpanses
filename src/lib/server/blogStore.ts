import type { Block, InternalLink, Post } from "@/lib/blog";

/**
 * Server-side blog store backed by D1. Three concerns:
 *   - blog_posts    — published/draft articles (shared, crawlable, SSR'd)
 *   - blog_keywords — the autopilot queue
 *   - blog_settings — single-row global config
 *
 * Pass the D1 binding in explicitly so this works both from request handlers
 * (via getDB) and from the scheduler tick (via env.DB).
 */

// --- Posts -----------------------------------------------------------------

export type StoredBlogPost = Post & {
  status: "draft" | "published";
  source: "auto" | "manual";
  keyword?: string;
  indexStatus?: Record<string, unknown>;
};

type PostRow = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  cover: string;
  body: string;
  date: string;
  read_mins: number;
  status: string;
  source: string;
  keyword: string | null;
  meta_title: string | null;
  meta_description: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  word_count: number | null;
  schema_json: string | null;
  target_keyword: string | null;
  secondary_keywords: string | null;
  internal_links: string | null;
  index_status: string | null;
};

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToPost(row: PostRow): StoredBlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    author: row.author,
    cover: row.cover,
    body: parseJson<Block[]>(row.body, []),
    date: row.date,
    readMins: row.read_mins,
    status: row.status === "draft" ? "draft" : "published",
    source: row.source === "manual" ? "manual" : "auto",
    keyword: row.keyword ?? undefined,
    metaTitle: row.meta_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    coverImageAlt: row.cover_image_alt ?? undefined,
    wordCount: row.word_count ?? undefined,
    targetKeyword: row.target_keyword ?? undefined,
    secondaryKeywords: parseJson<string[]>(row.secondary_keywords, []),
    internalLinks: parseJson<InternalLink[]>(row.internal_links, []),
    schemaJson: row.schema_json ?? undefined,
    indexStatus: parseJson<Record<string, unknown>>(row.index_status, {}),
  };
}

export async function listPublishedPosts(db: D1Database, limit = 100): Promise<StoredBlogPost[]> {
  const { results } = await db
    .prepare("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC LIMIT ?")
    .bind(limit)
    .all<PostRow>();
  return (results ?? []).map(rowToPost);
}

/** All posts (any status) — for the admin posts table. */
export async function listAllPosts(db: D1Database, limit = 200): Promise<StoredBlogPost[]> {
  const { results } = await db
    .prepare("SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT ?")
    .bind(limit)
    .all<PostRow>();
  return (results ?? []).map(rowToPost);
}

export async function getPublishedPost(db: D1Database, slug: string): Promise<StoredBlogPost | null> {
  const row = await db
    .prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'")
    .bind(slug)
    .first<PostRow>();
  return row ? rowToPost(row) : null;
}

export async function slugExists(db: D1Database, slug: string): Promise<boolean> {
  const row = await db.prepare("SELECT 1 FROM blog_posts WHERE slug = ?").bind(slug).first();
  return Boolean(row);
}

/** Lightweight projection of every post for duplicate detection + internal linking. */
export type PostLite = { slug: string; title: string; keyword: string | null; status: string };
export async function listPostLites(db: D1Database): Promise<PostLite[]> {
  const { results } = await db
    .prepare("SELECT slug, title, keyword, status FROM blog_posts ORDER BY created_at DESC")
    .all<PostLite>();
  return results ?? [];
}

export type NewBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  cover: string;
  body: Block[];
  readMins: number;
  status?: "draft" | "published";
  source?: "auto" | "manual";
  keyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  wordCount?: number;
  schemaJson?: string;
  targetKeyword?: string;
  secondaryKeywords?: string[];
  internalLinks?: InternalLink[];
};

export async function insertPost(db: D1Database, post: NewBlogPost): Promise<void> {
  const now = Date.now();
  const status = post.status ?? "published";
  await db
    .prepare(
      `INSERT INTO blog_posts
         (slug, title, excerpt, author, cover, body, date, read_mins, status, source, keyword,
          meta_title, meta_description, cover_image_url, cover_image_alt, word_count, schema_json,
          target_keyword, secondary_keywords, internal_links, published_at, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(
      post.slug,
      post.title,
      post.excerpt,
      post.author,
      post.cover,
      JSON.stringify(post.body),
      new Date(now).toISOString().slice(0, 10),
      post.readMins,
      status,
      post.source ?? "auto",
      post.keyword ?? null,
      post.metaTitle ?? null,
      post.metaDescription ?? null,
      post.coverImageUrl ?? null,
      post.coverImageAlt ?? null,
      post.wordCount ?? 0,
      post.schemaJson ?? null,
      post.targetKeyword ?? post.keyword ?? null,
      JSON.stringify(post.secondaryKeywords ?? []),
      JSON.stringify(post.internalLinks ?? []),
      status === "published" ? now : null,
      now,
      now
    )
    .run();
}

export async function setPostStatus(
  db: D1Database,
  slug: string,
  status: "draft" | "published"
): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      "UPDATE blog_posts SET status = ?, published_at = COALESCE(published_at, ?), updated_at = ? WHERE slug = ?"
    )
    .bind(status, status === "published" ? now : null, now, slug)
    .run();
}

export async function deletePost(db: D1Database, slug: string): Promise<void> {
  await db.prepare("DELETE FROM blog_posts WHERE slug = ?").bind(slug).run();
}

export async function setIndexStatus(
  db: D1Database,
  slug: string,
  indexStatus: Record<string, unknown>
): Promise<void> {
  await db
    .prepare("UPDATE blog_posts SET index_status = ?, indexed_at = COALESCE(indexed_at, ?) WHERE slug = ?")
    .bind(JSON.stringify(indexStatus), Date.now(), slug)
    .run();
}

// --- Keyword queue ---------------------------------------------------------

export type KeywordStatus = "queued" | "processing" | "published" | "failed" | "skipped_duplicate";

export type KeywordRow = {
  id: number;
  keyword: string;
  status: KeywordStatus;
  priority: number;
  created_at: number;
  processed_at: number | null;
  error: string | null;
  post_slug: string | null;
};

export async function listKeywords(db: D1Database, limit = 200): Promise<KeywordRow[]> {
  const { results } = await db
    .prepare("SELECT * FROM blog_keywords ORDER BY status='queued' DESC, priority DESC, created_at ASC LIMIT ?")
    .bind(limit)
    .all<KeywordRow>();
  return results ?? [];
}

/**
 * Enqueue keywords, skipping ones already queued/processing (case-insensitive).
 * Returns how many were added vs skipped.
 */
export async function enqueueKeywords(
  db: D1Database,
  keywords: string[]
): Promise<{ added: number; skipped: number }> {
  const cleaned = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))];
  if (cleaned.length === 0) return { added: 0, skipped: 0 };

  const { results } = await db
    .prepare("SELECT LOWER(keyword) AS k FROM blog_keywords WHERE status IN ('queued','processing')")
    .all<{ k: string }>();
  const existing = new Set((results ?? []).map((r) => r.k));

  const now = Date.now();
  let added = 0;
  let skipped = 0;
  for (const kw of cleaned) {
    if (existing.has(kw.toLowerCase())) {
      skipped++;
      continue;
    }
    await db
      .prepare("INSERT INTO blog_keywords (keyword, status, created_at) VALUES (?, 'queued', ?)")
      .bind(kw, now)
      .run();
    existing.add(kw.toLowerCase());
    added++;
  }
  return { added, skipped };
}

/** The next keyword to process (highest priority, oldest first), or null. */
export async function nextQueuedKeyword(db: D1Database): Promise<KeywordRow | null> {
  const row = await db
    .prepare(
      "SELECT * FROM blog_keywords WHERE status = 'queued' ORDER BY priority DESC, created_at ASC LIMIT 1"
    )
    .first<KeywordRow>();
  return row ?? null;
}

export async function setKeywordStatus(
  db: D1Database,
  id: number,
  status: KeywordStatus,
  extra: { error?: string | null; postSlug?: string | null } = {}
): Promise<void> {
  await db
    .prepare(
      "UPDATE blog_keywords SET status = ?, processed_at = ?, error = ?, post_slug = ? WHERE id = ?"
    )
    .bind(
      status,
      status === "queued" ? null : Date.now(),
      extra.error ?? null,
      extra.postSlug ?? null,
      id
    )
    .run();
}

export async function deleteKeyword(db: D1Database, id: number): Promise<void> {
  await db.prepare("DELETE FROM blog_keywords WHERE id = ?").bind(id).run();
}

export async function retryKeyword(db: D1Database, id: number): Promise<void> {
  await db
    .prepare("UPDATE blog_keywords SET status = 'queued', error = NULL, processed_at = NULL WHERE id = ?")
    .bind(id)
    .run();
}
