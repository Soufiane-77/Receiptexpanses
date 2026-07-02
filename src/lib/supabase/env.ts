import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Supabase public config, read from the Cloudflare Worker env at runtime.
 *
 * These are intentionally NOT `NEXT_PUBLIC_*` (which would bake them into the
 * build) — per project decision the values live ONLY as Cloudflare env
 * (set as Worker secrets so a `wrangler deploy` never wipes them). Server code
 * reads them here; the browser gets them at runtime via /api/env.
 */
export type SupabaseEnv = { url: string; anonKey: string };

/** Returns the config, or null when unset (so callers can fail gracefully). */
export async function getSupabaseEnv(): Promise<SupabaseEnv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const url = env.SUPABASE_URL;
    const anonKey = env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    return { url, anonKey };
  } catch {
    return null;
  }
}
