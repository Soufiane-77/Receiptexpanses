/**
 * Image provider for the Autopilot Blog engine.
 *
 * Flow: search Pexels for a photo matching the post's keyword, copy the bytes
 * into R2, and return a URL on our own domain. Self-hosting matters here —
 * same-origin images are crawlable for Google Images, survive the provider
 * changing URLs, and avoid a third-party request on every page view.
 *
 * Degrades in two steps so publishing NEVER blocks on images:
 *   1. No R2 binding (bucket not enabled yet) -> hotlink the Pexels CDN URL.
 *   2. No PEXELS_API_KEY, or any failure at all -> return null, and the post
 *      falls back to its emoji cover + the site-wide /og.png card.
 */

import { SITE_URL } from "@/lib/seo";
import { getEnv } from "./db";

export type CoverImage = { url: string; alt: string };

/** Public path prefix for R2-served images. Deliberately NOT under /api/, which robots.txt disallows. */
const IMAGE_PATH = "/blog-images";

type PexelsPhoto = {
  id: number;
  alt?: string | null;
  photographer?: string | null;
  src?: { landscape?: string; large?: string; large2x?: string; original?: string };
};

/** Resolve a cover image for a post, or null when nothing is configured/available. */
export async function resolveCoverImage(keyword: string, title: string): Promise<CoverImage | null> {
  try {
    const env = await getEnv();
    const apiKey = (env.PEXELS_API_KEY ?? "").trim();
    if (!apiKey) {
      console.log("[cover] PEXELS_API_KEY not set — skipping image.");
      return null;
    }

    const photo = await searchPexels(apiKey, keyword);
    if (!photo) {
      console.log(`[cover] no Pexels result for "${imageQueryFor(keyword)}"`);
      return null;
    }

    // Pexels' "landscape" rendition is 1200x627 — effectively the OG card size.
    const sourceUrl = photo.src?.landscape || photo.src?.large2x || photo.src?.large || photo.src?.original;
    if (!sourceUrl) return null;

    const alt = buildAltText(keyword, title, photo.alt);

    // Prefer self-hosting in R2; fall back to the Pexels CDN if it isn't bound.
    const bucket = env.BLOG_IMAGES;
    if (!bucket) return { url: sourceUrl, alt };

    const key = `${slugForKey(keyword)}-${photo.id}.jpg`;
    const stored = await storeInR2(bucket, key, sourceUrl);
    return { url: stored ? `${SITE_URL}${IMAGE_PATH}/${key}` : sourceUrl, alt };
  } catch (err) {
    // Never block publishing on an image failure — but do say why.
    console.error(`[cover] failed: ${String(err)}`);
    return null;
  }
}

/** Pick a landscape photo for the keyword. Strips filler words that hurt image search. */
async function searchPexels(apiKey: string, keyword: string): Promise<PexelsPhoto | null> {
  const query = imageQueryFor(keyword);
  const url =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
    `&per_page=15&orientation=landscape&size=medium`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) {
    console.error(`[cover] Pexels API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return null;
  }
  const data = (await res.json()) as { photos?: PexelsPhoto[] };
  const photos = (data.photos ?? []).filter((p) => p.src?.landscape || p.src?.large);
  if (photos.length === 0) return null;
  // Rotate through the result set so consecutive posts don't share one photo.
  return photos[Math.floor(Math.random() * photos.length)] ?? null;
}

/**
 * Turn a target keyword into a sensible photo query. "fake receipt generator"
 * would return junk (or nothing) from a stock library, so map the receipt
 * vocabulary onto imagery that actually exists: desks, bookkeeping, shopping.
 */
export function imageQueryFor(keyword: string): string {
  const k = keyword.toLowerCase();
  if (/hotel|lodging|airbnb|vacation/.test(k)) return "hotel reception desk";
  if (/uber|taxi|cab|ride/.test(k)) return "taxi city street";
  if (/fuel|gas station|petrol/.test(k)) return "gas station pump";
  if (/restaurant|food|cafe|coffee|dining/.test(k)) return "restaurant bill table";
  if (/grocery|supermarket|store|retail|walmart/.test(k)) return "grocery shopping checkout";
  if (/parking/.test(k)) return "parking garage";
  if (/pharmacy|medical/.test(k)) return "pharmacy counter";
  if (/tax|1099|deduction|accounting|expense/.test(k)) return "accounting desk calculator";
  if (/invoice|freelance|business/.test(k)) return "small business paperwork desk";
  // Default: generic receipt/bookkeeping imagery rather than the literal phrase.
  return "receipt paper desk bookkeeping";
}

/**
 * Descriptive alt text: the photo's own description when Pexels supplies one,
 * always tied back to the article topic. Accessibility first, SEO second.
 */
export function buildAltText(keyword: string, title: string, photoAlt?: string | null): string {
  const clean = (photoAlt ?? "").replace(/\s+/g, " ").trim();
  if (clean) return `${clean} — illustrating ${keyword.toLowerCase()}`.slice(0, 160);
  return `Illustration for ${title} — a guide about ${keyword.toLowerCase()}`.slice(0, 160);
}

/** Copy the photo bytes into R2. Returns false on any failure (caller hotlinks instead). */
async function storeInR2(bucket: R2Bucket, key: string, sourceUrl: string): Promise<boolean> {
  try {
    const existing = await bucket.head(key);
    if (existing) return true; // already stored — don't re-download
    const res = await fetch(sourceUrl);
    if (!res.ok || !res.body) return false;
    await bucket.put(key, res.body, {
      httpMetadata: {
        contentType: res.headers.get("content-type") ?? "image/jpeg",
        cacheControl: "public, max-age=31536000, immutable",
      },
    });
    return true;
  } catch {
    return false;
  }
}

function slugForKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
