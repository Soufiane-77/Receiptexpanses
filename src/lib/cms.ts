"use client";

import type { Block, Post } from "./blog";

/**
 * Browser-stored blog posts (CMS). Because the app has no backend, "publishing"
 * here means saving to localStorage — posts are visible in THIS browser and are
 * rendered client-side. They are NOT statically generated, NOT in the build-time
 * sitemap, and NOT visible to other visitors or crawlers. To publish posts the
 * world can see, you need a backend/CMS + a rebuild or a database-backed route.
 */

export type PostStatus = "draft" | "published";
export type PostSource = "manual" | "auto";

export type StoredPost = Post & {
  status: PostStatus;
  source: PostSource;
  createdAt: string;
  updatedAt: string;
  keyword?: string;
};

const KEY = "receiptforge:cms-posts";

function read(): StoredPost[] {
  if (typeof window === "undefined") return [];
  try {
    return (JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as StoredPost[]) ?? [];
  } catch {
    return [];
  }
}

function write(posts: StoredPost[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(posts));
}

export function listPosts(): StoredPost[] {
  return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listPublished(): StoredPost[] {
  return listPosts().filter((p) => p.status === "published");
}

export function getStoredPost(slug: string): StoredPost | undefined {
  return read().find((p) => p.slug === slug);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Rough read-time estimate from the body text (~200 wpm). */
export function estimateReadMins(body: Block[]): number {
  const words = body
    .map((b) => (b.type === "ul" ? b.items.join(" ") : b.text))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function uniqueSlug(base: string, existing: StoredPost[], ignoreId?: string): string {
  let slug = base || `post-${Date.now()}`;
  let n = 2;
  while (existing.some((p) => p.slug === slug && p.slug !== ignoreId)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export type UpsertInput = {
  id?: string;
  slug?: string;
  title: string;
  excerpt: string;
  author: string;
  cover: string;
  body: Block[];
  status: PostStatus;
  source?: PostSource;
  keyword?: string;
};

/** Create or update a post. Returns the saved post. */
export function upsertPost(input: UpsertInput): StoredPost {
  const posts = read();
  const now = new Date().toISOString();
  const existing = input.id ? posts.find((p) => p.slug === input.id) : undefined;

  const slug = existing
    ? existing.slug
    : uniqueSlug(input.slug || slugify(input.title), posts);

  const saved: StoredPost = {
    slug,
    title: input.title,
    excerpt: input.excerpt,
    author: input.author,
    cover: input.cover,
    body: input.body,
    date: existing?.date ?? now.slice(0, 10),
    readMins: estimateReadMins(input.body),
    status: input.status,
    source: input.source ?? existing?.source ?? "manual",
    keyword: input.keyword ?? existing?.keyword,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const next = existing ? posts.map((p) => (p.slug === slug ? saved : p)) : [saved, ...posts];
  write(next);
  return saved;
}

export function setStatus(slug: string, status: PostStatus): void {
  write(read().map((p) => (p.slug === slug ? { ...p, status, updatedAt: new Date().toISOString() } : p)));
}

export function removePost(slug: string): void {
  write(read().filter((p) => p.slug !== slug));
}

/**
 * Convert plain editor text into post blocks.
 * - `## heading` → h2
 * - lines starting with `- ` → list items (grouped into a ul)
 * - other non-empty lines → paragraphs
 */
export function textToBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push({ type: "ul", items: bullets });
      bullets = [];
    }
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
    } else if (line.startsWith("- ")) {
      bullets.push(line.slice(2).trim());
    } else {
      flush();
      blocks.push({ type: "p", text: line });
    }
  }
  flush();
  return blocks;
}

/** Inverse of textToBlocks, for editing an existing post. */
export function blocksToText(body: Block[]): string {
  return body
    .map((b) => {
      if (b.type === "h2") return `## ${b.text}`;
      if (b.type === "ul") return b.items.map((i) => `- ${i}`).join("\n");
      return b.text;
    })
    .join("\n\n");
}
