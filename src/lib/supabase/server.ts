import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client bound to the current request's cookies (server-side).
 * Returns null when Supabase env isn't configured.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  const cfg = await getSupabaseEnv();
  if (!cfg) return null;
  const cookieStore = await cookies();
  return createServerClient(cfg.url, cfg.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component render — cookies are read-only there.
          // Route handlers (where we mutate auth) can set them fine.
        }
      },
    },
  });
}

/** The current authenticated Supabase user (server-side), or null. */
export async function getServerUser(): Promise<User | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}
