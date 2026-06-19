# ReceiptExpenses

> A free, **privacy-first online receipt maker**. Pick a template, fill in a live form,
> watch the receipt build in real time, then download it as **PDF/PNG** or print.
> Everything runs **client-side** — no backend, nothing is uploaded.

ReceiptExpenses is a [Next.js 15](https://nextjs.org) (App Router) + TypeScript app.
A user chooses one of **15 receipt templates**, customizes business details and line items
in a split-screen editor, sees a pixel-perfect live preview, and exports it. Drafts and
(simulated) accounts persist to `localStorage`, so a refresh never loses work.

---

## Table of contents

- [Ethical scope (read this)](#ethical-scope-read-this)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Routes](#routes)
- [Project structure](#project-structure)
- [Core architecture](#core-architecture)
  - [The Receipt data model](#1-the-receipt-data-model)
  - [Template registry (the heart of the app)](#2-template-registry-the-heart-of-the-app)
  - [The live editor](#3-the-live-editor)
  - [Money & calculations](#4-money--calculations)
  - [Export (PDF / PNG / print)](#5-export-pdf--png--print)
  - [Persistence](#6-persistence-localstorage)
  - [Accounts & subscription (simulated)](#7-accounts--subscription-simulated)
  - [Admin panel](#8-admin-panel)
  - [SEO system](#9-seo-system)
  - [Design system & accessibility](#10-design-system--accessibility)
- [Common how-tos](#common-how-tos)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known limitations & path to production](#known-limitations--path-to-production)
- [Gotchas](#gotchas)

---
## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript (strict, `noUncheckedIndexedAccess`, no `any`) |
| UI | React 19, Tailwind CSS 3 |
| Fonts | `next/font` — Inter (body) + Plus Jakarta Sans (display) |
| Forms | React Hook Form + Zod |
| Export | html2canvas + jsPDF |
| Tests | Vitest |
| State | React state + `localStorage` (via `useSyncExternalStore` for auth) |

No database, no server actions, no API routes — the app is fully static/client-side and
deploys as a static-friendly Next build.

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

> On a machine where port 3000 is taken, use another port:
> ```powershell
> $env:PORT=3001; npm run dev      # PowerShell
> ```
> ```bash
> PORT=3001 npm run dev            # bash
> ```

Requires **Node 18.18+** (developed on Node 24).

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server (HMR). |
| `npm run build` | Production build. **Stop `npm run dev` first** (they share `.next`). |
| `npm start` | Serve the production build. |
| `npm run lint` | Next/ESLint. |
| `npm test` | Run the Vitest suite once. |
| `npm run test:watch` | Vitest in watch mode. |

---

## Routes

| Path | Type | Purpose |
|---|---|---|
| `/` | Static | Landing: hero, template grid, why/how/FAQ |
| `/create` | Dynamic | The editor (reads `?template=<id>` or the saved draft) |
| `/receipts` | Static | All receipt types, grouped by category (SEO hub) |
| `/receipts/[slug]` | SSG | One landing page **per template** (SEO) |
| `/pricing` | Static | Free vs Pro plans |
| `/dashboard` | Client | Auth-gated user dashboard |
| `/login`, `/signup` | Static | Auth pages |
| `/blogs`, `/blogs/[slug]` | Dynamic | Blog index + posts (D1-backed + static set) |
| `/faq`, `/about`, `/privacy`, `/terms` | Static | Content/trust pages |
| `/admin` | Client | Admin panel (soft password gate) |
| `/admin/blog` | Client | **Autopilot Blog** console (also a tab in `/admin`) |
| `/api/admin/blog` | Dynamic | Autopilot config + keyword/post actions (token-gated) |
| `/api/cron/run` | Dynamic | Scheduler tick for an external cron (token-gated) |
| `/api/indexnow` | Dynamic | IndexNow key file (engine ownership check) |
| `/sitemap.xml`, `/robots.txt`, `/icon.svg` | Generated | SEO/meta |

`/create` and `/admin` live **outside** the `(site)` route group so they use their own
chrome instead of the shared header/footer.

---

## Project structure

```
src/
  app/
    layout.tsx              Root layout: fonts, global SEO metadata
    globals.css             Tailwind layers, focus-visible, reduced-motion, print CSS
    icon.svg                Favicon (brand mark)
    not-found.tsx           Custom 404
    error.tsx               Error boundary
    robots.ts  sitemap.ts   Generated robots.txt / sitemap.xml

    (site)/                 Pages that share SiteHeader + SiteFooter
      layout.tsx            Header/footer wrapper
      page.tsx              Landing page
      receipts/            page.tsx (index) + [slug]/page.tsx (per-type SEO, SSG)
      pricing/             page.tsx + PricingClient.tsx
      blogs/               page.tsx + [slug]/page.tsx (SSG)
      dashboard/           page.tsx (auth-gated)
      login/ signup/       Auth pages (wrap <AuthForm/>)
      faq/ about/ privacy/ terms/

    create/                 Editor route (own chrome)
      page.tsx              Server: reads ?template, renders <CreateClient/>
      CreateClient.tsx      Client: picks initial Receipt (draft or preset), renders <Editor/>
    admin/page.tsx          Admin panel (own chrome)

  components/
    Editor.tsx              Split-screen form + live preview + export bar (the big one)
    ReceiptPreview.tsx      Renders a Receipt via its registered template (forwardRef for export)
    TemplateGrid.tsx        Landing grid + category filter (honours admin-enabled set)
    TemplateIcon.tsx        Maps a template id -> SVG icon
    SiteHeader.tsx          Auth-aware top nav
    SiteFooter.tsx          Footer with sitemap-style link columns
    Logo.tsx                Brand mark (LogoMark) + two-tone wordmark
    Button.tsx              <Button> / <ButtonLink> (variants, sizes, a11y states)
    fields.tsx              Form primitives: Field, Section, Toggle, inputCls
    AuthForm.tsx            Shared login/signup form
    NewsletterForm.tsx      Blog newsletter capture
    FaqList.tsx             <details> accordion (used on home, /faq, type pages)
    JsonLd.tsx              Renders a <script type="application/ld+json">
    Reveal.tsx              Scroll-reveal wrapper (IntersectionObserver, reduced-motion aware)
    icons.tsx               Lucide-style SVG icon set (no emoji-as-icon)

  lib/
    types.ts                The Receipt / LineItem / TemplateExtras types
    calc.ts                 Money math + Intl currency formatting   (unit-tested)
    calc.test.ts            Vitest suite for calc.ts
    schema.ts               Zod schema mirroring the Receipt type
    currencies.ts           Supported currencies + per-currency locale
    samples.ts              Per-template preset receipts (PRESETS, presetFor)
    id.ts                   newId(), newReceiptNo()
    export.ts               exportPNG / exportPDF / printReceipt
    storage.ts              Draft + saved-receipt localStorage helpers
    auth.ts                 Client account store (useSyncExternalStore) + useCurrentUser
    subscription.ts         Plans, useIsPro, gating constants, newsletter
    adminSettings.ts        Admin settings store + soft auth + enabled-template logic
    blog.ts                 Blog post content + lookup
    seo.ts                  SITE_URL/SITE_NAME, FAQ content, per-type FAQ builder

  templates/
    registry.tsx            SINGLE SOURCE OF TRUTH: TEMPLATES[], CATEGORIES, getTemplate()
    TemplateProps.ts        Props every template layout receives ({ receipt, totals })
    parts.tsx               Shared receipt sub-components (header, totals, barcode, etc.)
    GenericTemplate.tsx     ┐
    RestaurantTemplate.tsx  │ 6 layout components. The 15 registry entries reuse these
    ThermalTemplate.tsx     │ (e.g. cafe/grocery -> Thermal; hotel/service -> Generic).
    FuelTemplate.tsx        │
    TaxiTemplate.tsx        │
    ParkingTemplate.tsx     ┘
```

---

## Core architecture

### 1. The `Receipt` data model

Everything revolves around one type in `src/lib/types.ts`:

```ts
type Receipt = {
  templateId: string;          // which layout renders this
  business: { name; address; phone; logoDataUrl? };
  meta: { receiptNo; date; time; cashier? };
  items: LineItem[];           // { id, qty, name, unitPrice }
  currency: string;            // ISO code
  locale: string;              // for Intl.NumberFormat
  taxRatePct: number;
  tipAmount?: number;
  paymentMethod: "cash" | "card" | "other";
  cardLast4?: string;
  footerNote?: string;
  showTax; showTip; showSignatureLine?; showBarcode?; showFooter;  // visibility toggles
  accentColor: string;         // hex
  fontSize: "sm" | "base" | "lg";
  extras: TemplateExtras;      // template-specific fields (fuel gallons, taxi fare, …)
};
```

One model serves all templates. Fields that only some templates use live in `extras`,
so switching templates carries shared data over. `schema.ts` is the Zod mirror used by
the form.

### 2. Template registry (the heart of the app)

`src/templates/registry.tsx` exports `TEMPLATES: TemplateDef[]` — the **single source of
truth**. Each entry is:

```ts
{
  id, name, description,
  category,                    // "Business" | "Food & Drink" | "Retail" | "Travel" | "Services"
  thumbnail,                   // emoji fallback (UI renders <TemplateIcon> instead)
  Component,                   // a layout component taking { receipt, totals }
  seo: { keyword, blurb, useCases }   // drives the /receipts/[id] landing page
}
```

Because the grid, editor dropdown, `/receipts/[slug]` SEO pages, the sitemap, and
`presetFor()` all **derive from this array**, adding one entry wires up the whole app.
Layout components are reusable — 15 templates are built from 6 layouts.

### 3. The live editor

`components/Editor.tsx` is a client component:

- `react-hook-form` holds the `Receipt`; `watch()` feeds a live `Receipt` to
  `<ReceiptPreview>` on every keystroke.
- `useFieldArray` powers add/remove/reorder line items.
- Template-specific field sections render conditionally on `templateId`.
- A debounced `useEffect` writes the draft to `localStorage`.
- `<ReceiptPreview ref>` forwards a DOM ref so export can capture the exact node.
- Watermark + save-limit are gated by `useIsPro()` / `useCurrentUser()`.

`CreateClient.tsx` decides the **initial** receipt: a `?template=` preset (with admin
defaults applied) or the restored draft.

### 4. Money & calculations

`src/lib/calc.ts` (unit-tested in `calc.test.ts`):

- `round2`, `lineTotal`, `subtotal`, `taxAmount`, `computeTotals(receipt)`.
- `formatMoney(amount, currency, locale)` via `Intl.NumberFormat` with a safe fallback.
- `computeTotals` respects the `showTax`/`showTip` toggles.

Always format money through `formatMoney`; never hand-roll currency strings.

### 5. Export (PDF / PNG / print)

`src/lib/export.ts`:

- `exportPNG(node, receiptNo)` and `exportPDF(node, receiptNo)` rasterize the preview
  node with html2canvas (2× scale) and download via jsPDF / data URL.
- `printReceipt()` calls `window.print()`; `globals.css` isolates `#print-area`.
- The watermark lives **inside** the captured node so it appears in exports for Free users.

### 6. Persistence (localStorage)

`storage.ts` (drafts + saved receipts), `auth.ts`, `subscription.ts`, `adminSettings.ts`.

> **Note:** localStorage keys use a legacy `receiptforge:` prefix on purpose — renaming
> them would orphan any data saved during earlier development. They're invisible to users.

### 7. Accounts & subscription (simulated)

- `auth.ts` — `signUp/logIn/logOut`, `useCurrentUser()` via `useSyncExternalStore`
  (re-renders on change, syncs across tabs). Passwords are hashed with a **demo** hash —
  this is **not** real security.
- `subscription.ts` — `PLANS`, `useIsPro()`, `subscribePro()/cancelPro()`,
  `FREE_SAVE_LIMIT`, and the blog newsletter. "Checkout" is simulated (no payment).

### 8. Admin panel

`app/admin/page.tsx` + `adminSettings.ts`: soft password gate (default `admin`), saved-
receipt manager, template visibility/ordering, default values for new receipts. Settings
live in `localStorage`; the gate is convenience, not security.

### 9. SEO system

- **Per-type landing pages** `/receipts/[slug]` (SSG via `generateStaticParams`) with
  keyword titles, H1, how-it-works, use cases, FAQ, related links, CTA into the editor.
- **JSON-LD** (`components/JsonLd.tsx`): `WebApplication` + `Organization` + `FAQPage`
  on home; `SoftwareApplication` + `FAQPage` + `BreadcrumbList` on each type page;
  `BlogPosting` on posts.
- `sitemap.ts` and `robots.ts` derive from `TEMPLATES`, `POSTS`, and `SITE_URL`.
- Per-page metadata/canonicals; titles that already include the brand use `title.absolute`
  to avoid the root layout's `%s · ReceiptExpenses` template doubling.

### 9b. Autopilot Blog engine

A fully automated blog pipeline (Cloudflare Workers AI + D1). Paste keywords in
**`/admin/blog`**, pick draft or auto-publish, and a scheduled tick turns each
keyword into a complete SEO/GEO article — headings, a comparison table, a "Key
takeaways" block, an FAQ (with `FAQPage` schema), validated internal links, a
CTA, meta tags and `Article`/`BreadcrumbList` JSON-LD — then submits it for
indexing.

| Concern | File |
|---|---|
| Keyword queue + post/settings persistence | `src/lib/server/blogStore.ts` |
| Global config (cadence, voice, CTA, toggles) | `src/lib/server/blogSettings.ts` |
| Generation pipeline (outline → draft → self-edit → assemble) | `src/lib/server/blogPipeline.ts` |
| Scheduler (one keyword/tick, cadence + daily cap) | `src/lib/server/blogScheduler.ts` |
| Indexing (IndexNow + Google toggle) | `src/lib/server/blogIndexing.ts` |
| Image provider seam (disabled until configured) | `src/lib/server/blogImages.ts` |
| Token gate for the server routes | `src/lib/server/adminToken.ts` |
| Admin console | `src/components/admin/AutopilotBlog.tsx` |

The model is reached through a swappable `Completer` (Workers AI today, easy to
point at the Anthropic API later). Setup, the `BLOG_ADMIN_TOKEN` secret, the
external-cron URL, IndexNow, the Google toggle and the guardrails are documented
in **[SETUP-CLOUDFLARE.md](./SETUP-CLOUDFLARE.md#6-autopilot-blog)**.

### 10. Design system & accessibility

- **SVG icons only** (`icons.tsx`, Lucide-style) — no emoji as interface icons.
- Reusable `Button`/`ButtonLink` with hover/active/focus states; global `cursor-pointer`
  on clickables; visible `:focus-visible` rings.
- Motion: hero gradient blobs, staggered hero, scroll reveals (`Reveal.tsx`), button
  press. **All** motion respects `prefers-reduced-motion` (global CSS override + a check
  inside `Reveal`).
- Brand: indigo scale (trustworthy, not an "AI gradient"); `Logo.tsx` mark + two-tone
  wordmark; matching `icon.svg` favicon.

---

## Common how-tos

**Add a template**
1. Reuse a layout in `src/templates/` (or add a new `*Template.tsx` taking `{ receipt, totals }`).
2. Add one entry to `TEMPLATES` in `registry.tsx` (set `category` + `seo`).
3. Add a preset to `PRESETS` in `lib/samples.ts` and an icon mapping in `TemplateIcon.tsx`
   (add the SVG to `icons.tsx` if new).
4. Done — grid, editor, `/receipts/<id>`, and the sitemap update automatically.

**Add a currency** — append to `CURRENCIES` in `lib/currencies.ts` (code + label + locale).

**Add a blog post** — append to `POSTS` in `lib/blog.ts` (slug, body blocks). It becomes an
SSG page and a sitemap entry.

**Add an FAQ** — edit `GENERAL_FAQS` in `lib/seo.ts` (flows to home, `/faq`, and FAQ schema).

---

## Configuration

| What | Where |
|---|---|
| Public site URL (canonicals, sitemap, JSON-LD) | `SITE_URL` in `src/lib/seo.ts` **and** `metadataBase` in `src/app/layout.tsx` |
| Brand name | `SITE_NAME` in `src/lib/seo.ts` (+ `Logo.tsx` wordmark) |
| Admin password (default) | `defaultSettings()` in `src/lib/adminSettings.ts` (changeable in the panel) |
| Free plan limits / plan copy | `src/lib/subscription.ts` |
| Fonts | `src/app/layout.tsx` (`next/font`) |
| Theme tokens / animations | `tailwind.config.ts` |

---

## Testing

```bash
npm test
```

Vitest covers the money/calculation logic (`src/lib/calc.test.ts`, 10 tests) — rounding,
subtotal, tax, total with toggles, and currency formatting. Add tests next to the unit
under test as `*.test.ts`. The calc layer and any future money/auth boundaries are the
priority for coverage.

---

## Deployment

Deploys to **Vercel** with zero config (import the repo and ship). Any host that runs
Next.js 15 works too.

**Pre-deploy checklist**
- [ ] Set `SITE_URL` (`lib/seo.ts`) and `metadataBase` (`layout.tsx`) to the real domain.
- [ ] Replace the **demo** auth/subscription with a real backend if going multi-user
      (see below). Remove or re-secure `/admin`.
- [ ] Review/replace the template legal copy in `privacy` / `terms`.
- [ ] `npm run build` clean; `npm test` green.

---

## Known limitations & path to production

This is a **front-end-complete** app with **simulated** backend concerns:

- **Auth, subscription, newsletter** are localStorage simulations — no server, no real
  payments, demo password hashing. Fine for a single-browser demo; not multi-user secure.
- The admin gate is client-side only.

To productionize, swap the `lib/auth.ts` / `lib/subscription.ts` stores for a real backend
(e.g. a database + an auth provider + Stripe). The UI consumes them through hooks
(`useCurrentUser`, `useIsPro`) and plain functions, so the components don't change — only
those two modules do.

---

## Gotchas

- **Don't run `npm run build` while `npm run dev` is running** — they share `.next` and the
  build worker can crash (Windows: exit `3221226505`). Stop dev first; deleting `.next`
  clears a stale state.
- After a production build, a subsequent `next dev` may serve a **stale route manifest**
  (some routes 404). Fix: stop the server, delete `.next`, restart `npm run dev`.
- New templates need **all four** touch points (registry, preset, icon map, and an icon if
  new) or the icon/preset falls back to the generic default.
```
