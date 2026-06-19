import type { Block, Post } from "@/lib/blog";

/**
 * Server-side blog store backed by D1 (`blog_posts`). These posts are shared
 * across all visitors and rendered server-side, unlike the legacy localStorage
 * CMS (lib/cms.ts) which was per-browser only.
 *
 * Pass the D1 binding in explicitly so this works both from request handlers
 * (via getDB) and from the cron `scheduled()` handler (via env.DB).
 */

export type StoredBlogPost = Post & {
  status: "draft" | "published";
  source: "auto" | "manual";
  keyword?: string;
};

type Row = {
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
};

function rowToPost(row: Row): StoredBlogPost {
  let body: Block[] = [];
  try {
    body = JSON.parse(row.body) as Block[];
  } catch {
    body = [];
  }
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    author: row.author,
    cover: row.cover,
    body,
    date: row.date,
    readMins: row.read_mins,
    status: row.status === "draft" ? "draft" : "published",
    source: row.source === "manual" ? "manual" : "auto",
    keyword: row.keyword ?? undefined,
  };
}

export async function listPublishedPosts(db: D1Database, limit = 50): Promise<StoredBlogPost[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC LIMIT ?"
    )
    .bind(limit)
    .all<Row>();
  return (results ?? []).map(rowToPost);
}

export async function getPublishedPost(
  db: D1Database,
  slug: string
): Promise<StoredBlogPost | null> {
  const row = await db
    .prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'")
    .bind(slug)
    .first<Row>();
  return row ? rowToPost(row) : null;
}

export async function slugExists(db: D1Database, slug: string): Promise<boolean> {
  const row = await db.prepare("SELECT 1 FROM blog_posts WHERE slug = ?").bind(slug).first();
  return Boolean(row);
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
};

export async function insertPost(db: D1Database, post: NewBlogPost): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO blog_posts
         (slug, title, excerpt, author, cover, body, date, read_mins, status, source, keyword, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      post.status ?? "published",
      post.source ?? "auto",
      post.keyword ?? null,
      now,
      now
    )
    .run();
}
