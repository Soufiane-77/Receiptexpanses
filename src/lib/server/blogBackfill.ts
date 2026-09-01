import type { Block } from "@/lib/blog";
import { isExternalImage, rehostImage, resolveCoverImages } from "./blogImages";
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

export type RehostResult = {
  scanned: number;
  postsChanged: number;
  imagesRehosted: number;
  failed: number;
  items: { slug: string; rehosted: number; detail: string }[];
};

/**
 * Pull already-published images off the provider CDN and into our own storage.
 *
 * Posts generated before self-hosting existed point at images.pexels.com, which
 * means Google Images credits that domain, not ours, and the LCP element sits
 * on a third-party origin. Rewrites both the cover and any in-body image blocks.
 * A URL that cannot be copied is left as-is rather than broken.
 */
export async function rehostPostImages(
  db: D1Database,
  opts: { limit?: number; maxChanges?: number } = {}
): Promise<RehostResult> {
  const posts = await listAllPosts(db, opts.limit ?? 100);
  const items: RehostResult["items"] = [];
  let postsChanged = 0;
  let imagesRehosted = 0;
  let failed = 0;

  for (const post of posts) {
    // Budget the expensive work (a fetch + store per image), not the cheap scan.
    // Capping `limit` instead would re-read the same first N posts every run and
    // never reach the backlog once those N are already local.
    if (opts.maxChanges && postsChanged >= opts.maxChanges) break;

    const cover = post.coverImageUrl ?? "";
    const body = (post.body as Block[]) ?? [];
    const bodyExternal = body.filter(
      (b): b is Extract<Block, { type: "image" }> => b.type === "image" && isExternalImage(b.src)
    );
    const coverExternal = cover && isExternalImage(cover);
    if (!coverExternal && bodyExternal.length === 0) continue;

    let localCover = cover;
    let changed = 0;

    if (coverExternal) {
      const moved = await rehostImage(cover);
      if (moved) {
        localCover = moved;
        changed++;
      } else {
        failed++;
      }
    }

    // Rewrite in-body images, reusing one map so a repeated URL is fetched once.
    const rewritten = new Map<string, string>();
    const nextBody: Block[] = [];
    for (const block of body) {
      if (block.type !== "image" || !isExternalImage(block.src)) {
        nextBody.push(block);
        continue;
      }
      let local = rewritten.get(block.src);
      if (local === undefined) {
        local = (await rehostImage(block.src)) ?? "";
        rewritten.set(block.src, local);
      }
      if (local) {
        nextBody.push({ ...block, src: local });
        changed++;
      } else {
        nextBody.push(block);
        failed++;
      }
    }

    if (changed === 0) {
      items.push({ slug: post.slug, rehosted: 0, detail: "Could not copy — left pointing at the provider." });
      continue;
    }

    await setPostImages(db, post.slug, {
      coverUrl: localCover,
      coverAlt: post.coverImageAlt ?? post.title,
      body: nextBody,
    });
    postsChanged++;
    imagesRehosted += changed;
    items.push({ slug: post.slug, rehosted: changed, detail: `${changed} image(s) now self-hosted` });
  }

  return { scanned: posts.length, postsChanged, imagesRehosted, failed, items };
}
