/// <reference types="@cloudflare/workers-types" />

// Cloudflare Worker bindings + env vars available via getCloudflareContext().env.
// Keep in sync with wrangler.jsonc bindings and any secrets/vars you set.
interface CloudflareEnv {
  /** D1 database binding (see wrangler.jsonc d1_databases). */
  DB: D1Database;

  /** Workers AI binding (see wrangler.jsonc "ai") — powers the support chat. */
  AI: Ai;

  // --- Stripe (set as Worker secrets / vars; optional until billing is wired) ---
  /** Stripe secret key (sk_...). Set via `wrangler secret put STRIPE_SECRET_KEY`. */
  STRIPE_SECRET_KEY?: string;
  /** Stripe webhook signing secret (whsec_...). */
  STRIPE_WEBHOOK_SECRET?: string;
  /** Stripe Price ID for the Pro plan (price_...). */
  STRIPE_PRICE_PRO?: string;
  /** Public base URL of the app, e.g. https://receiptexpanses.workers.dev */
  APP_URL?: string;

  /**
   * Shared secret protecting the blog-automation admin + cron routes.
   * Set via `wrangler secret put BLOG_ADMIN_TOKEN`. Routes fail closed if unset.
   */
  BLOG_ADMIN_TOKEN?: string;

  // --- Supabase Auth (public config; stored ONLY as Cloudflare env — set as
  //     Worker secrets so `wrangler deploy` doesn't wipe them). The browser
  //     receives these at runtime via /api/env, not baked into the build. ---
  /** Supabase project URL, e.g. https://xxxx.supabase.co */
  SUPABASE_URL?: string;
  /** Supabase publishable/anon key (safe for the browser). */
  SUPABASE_ANON_KEY?: string;
  /**
   * Supabase service_role key — ADMIN level, server-only. Used solely by
   * /api/admin/users to list registered accounts. NEVER expose to the browser
   * and never add it to /api/env. Set with:
   *   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   */
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // --- Google OAuth (legacy: the old custom flow; now handled by Supabase.
  //     Kept for reference — safe to remove once fully migrated) ---
  /**
   * Pexels API key for blog cover images. Free key from pexels.com/api.
   * Set via `wrangler secret put PEXELS_API_KEY`. Images are skipped if unset.
   */
  PEXELS_API_KEY?: string;
  /**
   * R2 bucket holding self-hosted blog cover images, served at /blog-images/*.
   * Optional: without it the pipeline hotlinks the Pexels CDN instead.
   */
  BLOG_IMAGES?: R2Bucket;
  /**
   * KV fallback for blog images, used when R2 is not enabled on the account.
   * Same purpose as BLOG_IMAGES: keep images on our own domain.
   */
  BLOG_IMAGES_KV?: KVNamespace;

  /** Google OAuth client id. */
  GOOGLE_CLIENT_ID?: string;
  /** Google OAuth client secret. */
  GOOGLE_CLIENT_SECRET?: string;
}
