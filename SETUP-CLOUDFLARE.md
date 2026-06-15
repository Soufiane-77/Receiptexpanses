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

This creates the `users`, `sessions`, and `subscriptions` tables.

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

## Local development

```bash
# one-time: local secrets for `next dev`
echo "NEXTJS_ENV=development" > .dev.vars
# add STRIPE_SECRET_KEY / STRIPE_PRICE_PRO / STRIPE_WEBHOOK_SECRET (test mode) to .dev.vars

npm run db:migrate:local
npm run dev
```

`.dev.vars` is gitignored. Local D1 data lives under `.wrangler/`.
