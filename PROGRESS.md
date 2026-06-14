# ReceiptExpenses — Progress & Context

Snapshot of project state so work can resume after any interruption.
_Last updated: 2026-06-12_

## What this is
A free, **client-side** online receipt maker (Next.js 15 App Router + TS + Tailwind).
Pick a template → fill a live form → download PDF/PNG or print. Nothing is uploaded.
Brand: **ReceiptExpenses** (two-tone logo in `src/components/Logo.tsx`).

## Run it
```bash
npm install
npm run dev            # default :3000
# or, since :3000 is often occupied on this machine:
#   PowerShell:  $env:PORT=3001; npm run dev
```
Build: `npm run build` · Tests: `npm test` (10 passing — calc/money logic).
NOTE: stop the dev server before `npm run build` (they share `.next` and a running
dev server makes the build worker crash).

## Built so far
- **Editor** (`/create`): split-screen live preview, line items (add/remove/reorder),
  logo upload, currency/tax/tip/signature/barcode toggles, accent + font controls.
- **Export**: PNG, PDF (html2canvas + jsPDF), print. Free plan adds a watermark.
- **15 templates** in one registry (`src/templates/registry.tsx`) across 5 categories.
  Layouts: Generic, Restaurant, Thermal, Fuel, Taxi, Parking (others reuse these).
- **Accounts + dashboard** (`/dashboard`), **subscription** (`/pricing`, Free/Pro),
  **blog** (`/blogs`), **admin** (`/admin`, password `admin`).
  Auth/subscription/newsletter are **client-side simulations** (localStorage), no backend.
- **SEO**: per-type landing pages `/receipts/[slug]` (SSG), `/receipts` index, `/faq`,
  About/Privacy/Terms, JSON-LD, sitemap.xml (29 URLs), robots.txt, canonicals.
- **UI/UX**: SVG icon set (no emoji-as-icon), reusable Button, focus-visible rings,
  reduced-motion support, hero blob animation, scroll reveals (`src/components/Reveal.tsx`).


## Before deploying
- Set `SITE_URL` in `src/lib/seo.ts` to the real domain.
- Replace the client-side auth/subscription simulation with a real backend if going
  multi-user (e.g. Cloudflare D1 + Stripe). UI is structured so this is a drop-in.

## Resume a Claude Code session
From this folder: `claude --continue` (latest) or `claude --resume` (pick from list).
