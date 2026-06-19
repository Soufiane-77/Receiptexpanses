import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog";
import { TEMPLATES } from "@/templates/registry";
import { SITE_URL } from "@/lib/seo";
import { getDB } from "@/lib/server/db";
import { listPublishedPosts } from "@/lib/server/blogStore";

// Dynamic so newly published autopilot posts appear immediately with an
// accurate lastmod (engines discover them on the next crawl / via GSC).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const core = [
    { path: "", priority: 1.0, freq: "weekly" as const },
    { path: "/create", priority: 0.9, freq: "weekly" as const },
    { path: "/receipts", priority: 0.9, freq: "weekly" as const },
    { path: "/pricing", priority: 0.7, freq: "monthly" as const },
    { path: "/blogs", priority: 0.7, freq: "weekly" as const },
    { path: "/faq", priority: 0.6, freq: "monthly" as const },
    { path: "/about", priority: 0.5, freq: "yearly" as const },
    { path: "/contact", priority: 0.4, freq: "yearly" as const },
    { path: "/privacy", priority: 0.3, freq: "yearly" as const },
    { path: "/terms", priority: 0.3, freq: "yearly" as const },
    { path: "/refund", priority: 0.3, freq: "yearly" as const },
    { path: "/cookies", priority: 0.3, freq: "yearly" as const },
    { path: "/login", priority: 0.3, freq: "yearly" as const },
    { path: "/signup", priority: 0.4, freq: "yearly" as const },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const receiptTypes = TEMPLATES.map((t) => ({
    url: `${SITE_URL}/receipts/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Merge static + D1 posts, D1 winning on slug collisions.
  const bySlug = new Map<string, { url: string; date: string }>();
  for (const p of POSTS) bySlug.set(p.slug, { url: `${SITE_URL}/blogs/${p.slug}`, date: p.date });
  try {
    const db = await getDB();
    for (const p of await listPublishedPosts(db, 1000)) {
      bySlug.set(p.slug, { url: `${SITE_URL}/blogs/${p.slug}`, date: p.date });
    }
  } catch {
    // D1 unavailable (e.g. local prerender) — static posts only.
  }
  const posts = [...bySlug.values()].map((p) => ({
    url: p.url,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...core, ...receiptTypes, ...posts];
}
