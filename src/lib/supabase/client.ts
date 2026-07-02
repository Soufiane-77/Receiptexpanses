"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Runtime config injected by /api/env (loaded beforeInteractive in the layout).
type WindowEnv = { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string };

function readEnv(): { url: string; anonKey: string } {
  const e =
    (typeof window !== "undefined"
      ? (window as unknown as { __ENV__?: WindowEnv }).__ENV__
      : undefined) ?? {};
  return { url: e.SUPABASE_URL ?? "", anonKey: e.SUPABASE_ANON_KEY ?? "" };
}

/** True when the runtime config is present (Supabase is usable in the browser). */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = readEnv();
  return Boolean(url && anonKey);
}

let client: SupabaseClient | null = null;

/** Singleton browser Supabase client (cookie-backed, so the server can read the session). */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (client) return client;
  const { url, anonKey } = readEnv();
  client = createBrowserClient(url, anonKey);
  return client;
}
