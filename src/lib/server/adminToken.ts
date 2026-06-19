import { getEnv } from "./db";

/**
 * Shared-secret gate for the blog-automation admin + cron routes.
 *
 * The admin panel is only a client-side soft gate, so these server routes are
 * protected by a Worker secret (`BLOG_ADMIN_TOKEN`) instead. Set it once with:
 *   npx wrangler secret put BLOG_ADMIN_TOKEN
 *
 * The token may be supplied as `Authorization: Bearer <token>`, an
 * `x-admin-token` header, or a `?token=` query param (for simple external cron
 * services). Constant-time-ish compare to avoid trivial timing leaks.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isAuthorized(req: Request): Promise<boolean> {
  const env = await getEnv();
  // Trim defensively: `wrangler secret put` via a shell pipe can append a
  // trailing newline, which would otherwise never match.
  const expected = env.BLOG_ADMIN_TOKEN?.trim();
  if (!expected) return false; // fail closed if the secret isn't set

  const auth = req.headers.get("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const header = (req.headers.get("x-admin-token") ?? "").trim();
  const query = (new URL(req.url).searchParams.get("token") ?? "").trim();

  return [bearer, header, query].some((t) => t && safeEqual(t, expected));
}
