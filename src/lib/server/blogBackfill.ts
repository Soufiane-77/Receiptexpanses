import type { Block } from "@/lib/blog";
import { resolveCoverImages } from "./blogImages";
import { listAllPosts, setPostImages } from "./blogStore";
import { insertBodyImagesInto } from "./blogPipeline";

export type BackfillItem = {
  slug: string;
  ok: boolean;
  images: number;
  detail: string;
};

export type BackfillResult = {
  scanned: number;
  updated: number;
  skipped: number;
  items: BackfillItem[];
};

/**
 * Add images to posts published before the image provider existed.
 *
 * Reports a per-post reason rather than failing silently, so it doubles as the
 * diagnostic when images aren't appearing (bad API key, no stock match, R2
 * unbound, etc.).
 */
export async function backfillPostImages(
  db: D1Database,
  opts: { limit?: number; perPost?: number; force?: boolean } = {}
): Promise<BackfillResult> {
  const perPost = Math.min(Math.max(opts.perPost ?? 3, 1), 5);
  const posts = await listAllPosts(db, opts.limit ?? 100);

  const items: BackfillItem[] = [];
  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    if (post.coverImageUrl && !opts.force) {
      skipped++;
      continue;
    }

    const topic = post.keyword || post.targetKeyword || post.title;
    const images = await resolveCoverImages(topic, post.title, perPost);

    if (images.length === 0) {
      items.push({
        slug: post.slug,
        ok: false,
        images: 0,
        detail: "No image returned — check PEXELS_API_KEY, or the topic had no stock match.",
      });
      continue;
    }

    const cover = images[0]!;
    // Only rewrite the body when we have extras AND it has no images yet.
    const body = post.body as Block[];
    const alreadyHasImages = body.some((b) => b.type === "image");
    const nextBody =
      images.length > 1 && !alreadyHasImages
        ? insertBodyImagesInto(body, images.slice(1))
        : undefined;

    await setPostImages(db, post.slug, {
      coverUrl: cover.url,
      coverAlt: cover.alt,
      body: nextBody,
    });

    updated++;
    items.push({
      slug: post.slug,
      ok: true,
      images: images.length,
      detail: `cover + ${Math.max(0, images.length - 1)} in-body`,
    });
  }

  return { scanned: posts.length, updated, skipped, items };
}
