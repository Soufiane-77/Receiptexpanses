/**
 * Image provider seam for the Autopilot Blog engine.
 *
 * Kept deliberately behind a single function so a real source (Unsplash /
 * Pexels / Cloudflare Images / an AI image generator) can be plugged in later
 * without touching the pipeline. Until then it returns null and publishing
 * falls back to the emoji cover — generation never blocks on images.
 *
 * To enable a provider later, implement fetchProviderImage() and flip ENABLED.
 */

export type CoverImage = { url: string; alt: string };

const ENABLED = false;

/** Resolve a cover image for a post, or null when no provider is configured. */
export async function resolveCoverImage(keyword: string, title: string): Promise<CoverImage | null> {
  if (!ENABLED) return null;
  try {
    return await fetchProviderImage(keyword, title);
  } catch {
    return null; // never block publishing on an image failure
  }
}

/** Keyword-aware, descriptive alt text (accessibility + SEO). */
export function buildAltText(keyword: string, title: string): string {
  return `Illustration for ${title} — a guide about ${keyword.toLowerCase()}`;
}

// Placeholder until a provider is wired up. Intentionally unused while ENABLED=false.
async function fetchProviderImage(keyword: string, title: string): Promise<CoverImage | null> {
  void keyword;
  void title;
  return null;
}
