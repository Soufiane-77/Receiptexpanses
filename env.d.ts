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

  // --- Google OAuth (set as Worker secrets; optional — Google sign-in is
  //     hidden/disabled until both are present) ---
  /** Google OAuth client id. Set via `wrangler secret put GOOGLE_CLIENT_ID`. */
  GOOGLE_CLIENT_ID?: string;
  /** Google OAuth client secret. Set via `wrangler secret put GOOGLE_CLIENT_SECRET`. */
  GOOGLE_CLIENT_SECRET?: string;
}
