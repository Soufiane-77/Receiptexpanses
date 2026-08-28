import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog";
import { TEMPLATES, templateSlug } from "@/templates/registry";
import { GUIDES } from "@/content/guides";
import { LAST_UPDATED_ISO, SITE_URL } from "@/lib/seo";
import { getDB } from "@/lib/server/db";
import { listPublishedPosts } from "@/lib/server/blogStore";

// Dynamic so newly published autopilot posts appear immediately with an
// accurate lastmod (engines discover them on the next crawl / via GSC).
export const dynamic = "force-dynamic";

/**
 * Editorial review date for pages that have no per-page date of their own.
 *
 * This used to be `new Date()`, which meant every static URL claimed to have
 * changed the instant the sitemap was fetched — a new timestamp on every single
 * request. Google treats demonstrably false lastmod values as a reason to
 * ignore lastmod for the whole site, so bump LAST_UPDATED_ISO when the copy
 * actually changes rather than reporting "now".
 */
const REVIEWED = new Date(LAST_UPDATED_ISO);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /login and /signup are deliberately absent: they are utility pages with no
  // search value and are marked noindex, so listing them only spends crawl budget.
  const core = [
    { path: "", priority: 1.0, freq: "weekly" as const },
    { path: "/create", priority: 0.9, freq: "weekly" as const },
    { path: "/receipts", priority: 0.9, freq: "weekly" as const },
    { path: "/pricing", priority: 0.7, freq: "monthly" as const },
    { path: "/blogs", priority: 0.7, freq: "weekly" as const },
    { path: "/guides", priority: 0.8, freq: "weekly" as const },
    { path: "/faq", priority: 0.6, freq: "monthly" as const },
    { path: "/about", priority: 0.5, freq: "yearly" as const },
    { path: "/contact", priority: 0.4, freq: "yearly" as const },
    { path: "/privacy", priority: 0.3, freq: "yearly" as const },
    { path: "/terms", priority: 0.3, freq: "yearly" as const },
    { path: "/refund", priority: 0.3, freq: "yearly" as const },
    { path: "/cookies", priority: 0.3, freq: "yearly" as const },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: REVIEWED,
    changeFrequency: r.freq,
    priority: r.priority,
    // Surface the landing artwork to Google Images from the home entry.
    ...(r.path === ""
      ? {
          images: [
            `${SITE_URL}/landing/hero-2000.webp`,
            `${SITE_URL}/landing/step-01-800.webp`,
            `${SITE_URL}/landing/step-02-800.webp`,
            `${SITE_URL}/landing/step-03-800.webp`,
          ],
        }
      : {}),
  }));

  const receiptTypes = TEMPLATES.map((t) => ({
    url: `${SITE_URL}/${templateSlug(t)}`,
    lastModified: REVIEWED,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const guides = GUIDES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.dateModified),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Merge static + D1 posts, D1 winning on slug collisions.
  const bySlug = new Map<string, { url: string; date: string; image?: string }>();
  for (const p of POSTS) bySlug.set(p.slug, { url: `${SITE_URL}/blogs/${p.slug}`, date: p.date });
  try {
    const db = await getDB();
    for (const p of await listPublishedPosts(db, 1000)) {
      bySlug.set(p.slug, {
        url: `${SITE_URL}/blogs/${p.slug}`,
        date: p.date,
        image: p.coverImageUrl || undefined,
      });
    }
  } catch {
    // D1 unavailable (e.g. local prerender) — static posts only.
  }
  // `images` emits <image:image> entries — how Google discovers blog cover art
  // for Google Images.
  //
  // Only our own URLs go in. Two reasons, and the first one is a hard bug:
  // Next.js escapes <loc> but NOT <image:loc>, so a provider URL carrying a
  // query string ("...jpeg?auto=compress&cs=tinysrgb") emits a bare "&" and the
  // whole document fails to parse — one hotlinked cover image invalidates the
  // entire sitemap, not just its own entry. Second, an image sitemap is a claim
  // that you host the image; Google credits it to whoever serves it, so listing
  // a Pexels CDN URL does nothing for us anyway. Posts still hotlinking are
  // simply listed without an image until the re-host sweep moves them over.
  const ownImage = (url: string) => url.startsWith(`${SITE_URL}/`) && !/[&<>"']/.test(url);

  const posts = [...bySlug.values()].map((p) => ({
    url: p.url,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
    ...(p.image && ownImage(p.image) ? { images: [p.image] } : {}),
  }));

  return [...core, ...receiptTypes, ...guides, ...posts];
}
