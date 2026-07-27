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

/**
 * Strip whitespace and any BOM / zero-width characters.
 *
 * `wrangler secret put` fed from a shell pipe can prepend a UTF-8 BOM (U+FEFF)
 * or append a newline. Both are invisible and neither is stripped by the
 * platform, so an unclean value makes fetch() throw "Failed to parse URL" or
 * sends a malformed auth header. Always sanitize before use.
 */
export function cleanEnvValue(v: string | undefined): string {
  return (v ?? "").replace(/[﻿​-‍]/g, "").trim();
}

/** Returns the config, or null when unset (so callers can fail gracefully). */
export async function getSupabaseEnv(): Promise<SupabaseEnv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const url = cleanEnvValue(env.SUPABASE_URL).replace(/\/+$/, "");
    const anonKey = cleanEnvValue(env.SUPABASE_ANON_KEY);
    if (!url || !anonKey) return null;
    return { url, anonKey };
  } catch {
    return null;
  }
}
