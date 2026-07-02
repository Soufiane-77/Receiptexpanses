import { getSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

// Serves the public runtime config to the browser as a tiny JS file. Referenced
// from the root layout as a `beforeInteractive` script so `window.__ENV__` is
// set before the app hydrates — this keeps the Supabase URL + publishable key
// out of the build (they live only as Cloudflare env) while still reaching the
// client, including on statically-generated SEO pages.
export async function GET() {
  const cfg = await getSupabaseEnv();
  const payload = {
    SUPABASE_URL: cfg?.url ?? "",
    SUPABASE_ANON_KEY: cfg?.anonKey ?? "",
  };
  const body = `window.__ENV__=Object.assign(window.__ENV__||{},${JSON.stringify(payload)});`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
