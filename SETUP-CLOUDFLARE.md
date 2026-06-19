# Cloudflare setup — database, auth & subscriptions

The app now runs as a **Cloudflare Worker** (via OpenNext), backed by a **D1**
database, with real login (session cookies) and **Stripe** subscriptions.
Hosting moved off the static Pages export — the old `receiptexpanses.pages.dev`
Pages project will not serve this code; deploy as a Worker instead (steps below).

Everything in code is done. The steps here need your Cloudflare/Stripe accounts.

## 1. Install dependencies

```bash
npm install
```

## 2. Create the D1 database

```bash
npx wrangler login            # one-time browser auth
npx wrangler d1 create receiptexpanses-db
```

Copy the printed `database_id` into **`wrangler.jsonc`**, replacing
`REPLACE_WITH_D1_DATABASE_ID`.

## 3. Apply the database schema

```bash
npm run db:migrate:local      # local dev database
npm run db:migrate            # remote (production) database
```

This applies all migrations: `users`/`sessions`/`subscriptions` (0001), the
blog tables (0002), and the **Autopilot Blog** schema (0003 —
`blog_keywords`, `blog_settings`, and the SEO columns on `blog_posts`).

## 4. Stripe (subscriptions)

1. In the Stripe dashboard create a **Product** with a **recurring price**
   (e.g. Pro, $6/month). Copy the price id (`price_...`).
2. Set the Worker secrets/vars:
   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY     # sk_live_... or sk_test_...
   npx wrangler secret put STRIPE_PRICE_PRO       # price_...
   npx wrangler secret put APP_URL                # https://your-worker-domain (optional)
   ```
3. Create a webhook endpoint in Stripe pointing at
   `https://<your-worker-domain>/api/stripe/webhook` and subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

   Copy its signing secret and set it:
   ```bash
   npx wrangler secret put STRIPE_WEBHOOK_SECRET  # whsec_...
   ```

> Until Stripe is configured, the billing endpoints return a graceful 503 and
> the rest of the app (DB + auth) works normally.

## 5. Deploy

**Option A — from your machine:**
```bash
npm run deploy
```

**Option B — deploy on every GitHub push (recommended):**
In the Cloudflare dashboard → **Workers & Pages → Create → Workers → Connect to Git**,
select this repo, and set:
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx wrangler deploy`

Pushing to `main` then builds and deploys automatically.

## 6. Autopilot Blog

A fully automated blog: paste keywords in the admin, and a scheduled job
generates an SEO/GEO article per keyword (Workers AI — free), publishes or
saves a draft, and submits it for indexing.

### Env / secret

```bash
# Shared secret protecting every /api/admin/blog and /api/cron/run call.
# Use a long random value; the admin enters the same value in the panel.
printf '%s' "$(openssl rand -hex 24)" | npx wrangler secret put BLOG_ADMIN_TOKEN
```

> Set it with `printf`/`echo -n` (no trailing newline). Workers AI (`AI`) and
> D1 (`DB`) bindings are already in `wrangler.jsonc`.

### Use it

1. **Admin → Security:** paste the same `BLOG_ADMIN_TOKEN` value into "Blog
   automation token".
2. **Admin → Blog** (or visit `/admin/blog`): add keywords, set the cadence
   (interval, daily cap, min spacing) and **Mode**. Mode defaults to **draft**
   so you review the first batch before flipping to **auto-publish**.
3. **Run one now** to test, then turn the **scheduler On**.
4. **Unattended schedule:** create a free hourly job at e.g. cron-job.org
   hitting (copy the exact URL from the admin panel):
   ```
   https://<your-domain>/api/cron/run?token=<BLOG_ADMIN_TOKEN>
   ```
   Each tick publishes at most one post and only when the cadence allows.

### Indexing

- **IndexNow** (Bing/Yandex/Naver/Seznam) is on by default. A key is generated
  automatically and served at `/api/indexnow`; new URLs are POSTed on publish.
  Per-engine results show in the admin Posts table. **Google does not support
  IndexNow** — rely on the dynamic `/sitemap.xml` + internal links + Google
  Search Console for Google.
- **Google Indexing API** is **off by default**. Google officially restricts it
  to `JobPosting`/`BroadcastEvent` pages and may reject/penalise other use
  (~200/day quota). Only enable the toggle if you understand that; when enabled
  it uses a service-account JWT (set `google_sa_json` in `blog_settings`).

### Guardrails

Default **draft** mode, a low **daily cap** (2/day), **min spacing**, a
**word-count floor**, and a near-duplicate guard. "Submitted for indexing" is
not "indexed" — engines still decide on quality. Auto-publishing thin, scaled
content risks Google's scaled-content-abuse penalties, so review before going
full auto.

## Local development

```bash
# one-time: local secrets for `next dev`
echo "NEXTJS_ENV=development" > .dev.vars
# add STRIPE_SECRET_KEY / STRIPE_PRICE_PRO / STRIPE_WEBHOOK_SECRET (test mode) to .dev.vars

npm run db:migrate:local
npm run dev
```

`.dev.vars` is gitignored. Local D1 data lives under `.wrangler/`.
