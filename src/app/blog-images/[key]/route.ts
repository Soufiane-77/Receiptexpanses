import { getEnv } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/**
 * Serves blog cover images from R2 on our own domain.
 *
 * Deliberately NOT under /api/ — robots.txt disallows that prefix, and these
 * images should be crawlable (Google Images, social card fetchers).
 * Immutable cache: keys embed the source photo id, so content never changes.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!/^[a-z0-9][a-z0-9._-]{0,120}$/i.test(key)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const env = await getEnv();
    if (!env.BLOG_IMAGES) return new Response("Not configured", { status: 503 });

    const object = await env.BLOG_IMAGES.get(key);
    if (!object) return new Response("Not found", { status: 404 });

    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": object.httpEtag,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
