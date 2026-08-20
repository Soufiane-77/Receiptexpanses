/**
 * Image provider for the Autopilot Blog engine.
 *
 * Flow: search Pexels for photos matching the post's keyword, copy the bytes
 * into R2, and return URLs on our own domain. Self-hosting matters here —
 * same-origin images are crawlable for Google Images, survive the provider
 * changing URLs, and avoid a third-party request on every page view.
 *
 * Degrades in two steps so publishing NEVER blocks on images:
 *   1. No R2 binding (bucket not enabled yet) -> hotlink the Pexels CDN URL.
 *   2. No PEXELS_API_KEY, or any failure at all -> return [], and the post
 *      falls back to its emoji cover + the site-wide /og.png card.
 */

import { SITE_URL } from "@/lib/seo";
import { getEnv } from "./db";

export type CoverImage = { url: string; alt: string; credit?: string };

/** Public path prefix for R2-served images. Deliberately NOT under /api/, which robots.txt disallows. */
const IMAGE_PATH = "/blog-images";

type PexelsPhoto = {
  id: number;
  alt?: string | null;
  photographer?: string | null;
  src?: { landscape?: string; large?: string; large2x?: string; original?: string };
};

/** Strip whitespace + BOM: `wrangler secret put` fed from a pipe can prepend U+FEFF. */
function cleanKey(v: string | undefined): string {
  return (v ?? "").replace(/[\uFEFF\u200B-\u200D]/g, "").trim();
}

/**
 * Resolve up to `count` distinct images: [0] becomes the cover, the rest are
 * placed between body sections. Returns [] when unavailable — never throws.
 */
export async function resolveCoverImages(
  keyword: string,
  title: string,
  count = 3
): Promise<CoverImage[]> {
  try {
    const env = await getEnv();
    const apiKey = cleanKey(env.PEXELS_API_KEY);
    if (!apiKey) {
      console.log("[cover] PEXELS_API_KEY not set — skipping images.");
      return [];
    }

    const photos = await searchPexels(apiKey, keyword, count);
    if (photos.length === 0) return [];

    // Prefer R2 for media; fall back to KV so images stay same-origin even
    // when R2 has not been enabled on the account.
    const bucket = env.BLOG_IMAGES;
    const kv = env.BLOG_IMAGES_KV;
    const out: CoverImage[] = [];

    for (const photo of photos) {
      const sourceUrl =
        photo.src?.landscape || photo.src?.large2x || photo.src?.large || photo.src?.original;
      if (!sourceUrl) continue;

      const alt = buildAltText(keyword, title, photo.alt);
      const credit = photo.photographer ? `Photo: ${photo.photographer} / Pexels` : undefined;

      if (!bucket && !kv) {
        out.push({ url: sourceUrl, alt, credit });
        continue;
      }
      const key = `${slugForKey(keyword)}-${photo.id}.jpg`;
      const stored = bucket
        ? await storeInR2(bucket, key, sourceUrl)
        : await storeInKV(kv!, key, sourceUrl);
      out.push({ url: stored ? `${SITE_URL}${IMAGE_PATH}/${key}` : sourceUrl, alt, credit });
    }
    return out;
  } catch (err) {
    console.error(`[cover] failed: ${String(err)}`);
    return [];
  }
}

/** Single-image convenience wrapper. */
export async function resolveCoverImage(keyword: string, title: string): Promise<CoverImage | null> {
  const [first] = await resolveCoverImages(keyword, title, 1);
  return first ?? null;
}

/** Pick `count` distinct landscape photos for the keyword. */
async function searchPexels(apiKey: string, keyword: string, count: number): Promise<PexelsPhoto[]> {
  const query = imageQueryFor(keyword);
  const url =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
    `&per_page=30&orientation=landscape&size=medium`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) {
    console.error(`[cover] Pexels API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return [];
  }
  const data = (await res.json()) as { photos?: PexelsPhoto[] };
  const photos = (data.photos ?? []).filter((p) => p.src?.landscape || p.src?.large);
  if (photos.length === 0) {
    console.log(`[cover] no Pexels result for "${query}"`);
    return [];
  }
  // Shuffle so consecutive posts on similar topics don't reuse the same shots.
  for (let i = photos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [photos[i], photos[j]] = [photos[j]!, photos[i]!];
  }
  return photos.slice(0, count);
}

/**
 * Turn a target keyword into a sensible photo query. "fake receipt generator"
 * returns junk from a stock library, so map receipt vocabulary onto imagery
 * that actually exists: desks, bookkeeping, shopping.
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
  } catch (err) {
    console.error(`[cover] R2 put failed: ${String(err)}`);
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

/**
 * KV fallback for when R2 isn't enabled. KV caps values at 25 MB — far above a
 * ~200 KB photo — and is read-optimised, which suits images. Content type is
 * kept in the entry metadata so the serving route can set the right header.
 */
async function storeInKV(kv: KVNamespace, key: string, sourceUrl: string): Promise<boolean> {
  try {
    const existing = await kv.get(key, "stream");
    if (existing) return true;
    const res = await fetch(sourceUrl);
    if (!res.ok) return false;
    const bytes = await res.arrayBuffer();
    await kv.put(key, bytes, {
      metadata: { contentType: res.headers.get("content-type") ?? "image/jpeg" },
    });
    return true;
  } catch (err) {
    console.error(`[cover] KV put failed: ${String(err)}`);
    return false;
  }
}
