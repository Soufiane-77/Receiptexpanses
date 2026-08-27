import type { Metadata } from "next";
import Link from "next/link";
import TemplateGrid from "@/components/TemplateGrid";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import {
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  ShieldIcon,
  ZapIcon,
  DownloadIcon,
  WalmartLogoIcon,
  AirbnbLogoIcon,
  AmazonLogoIcon,
  UberLogoIcon,
  StarbucksLogoIcon,
  NikeLogoIcon,
  AdidasLogoIcon,
  AppleLogoIcon,
  JordanLogoIcon,
} from "@/components/icons";
import {
  GENERAL_FAQS,
  LAST_UPDATED_DISPLAY,
  LAST_UPDATED_ISO,
  SITE_DEFINITION,
  SITE_URL,
  faqJsonLd,
  orgJsonLd,
  softwareAppJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

// Title and description are kept inside Google's render limits (60 / 160 chars)
// so neither gets truncated in the SERP. Measured, not estimated.
export const metadata: Metadata = {
  title: { absolute: "Free Online Receipt Maker — PDF & PNG | ReceiptExpenses" },
  description:
    "Free online receipt maker: pick from 24+ templates, add your details, preview live, and download a pixel-perfect PDF or PNG. Runs in your browser.",
  alternates: { canonical: "/" },
};

const WHY = [
  {
    icon: EyeIcon,
    title: "Real-time live preview",
    text: "Every keystroke updates the receipt instantly — what you see is exactly what you download. No surprises after export.",
  },
  {
    icon: ShieldIcon,
    title: "Private by design",
    text: "ReceiptExpenses runs entirely in your browser. Your business details, logo and receipts are never uploaded to any server.",
  },
  {
    icon: ZapIcon,
    title: "Ready in under a minute",
    text: "A focused 3-step flow: choose a template, customise, download. No clutter, no learning curve.",
  },
  {
    icon: DownloadIcon,
    title: "PDF, PNG & print",
    text: "Export a pixel-perfect PDF or PNG, or print straight from your browser — free with an account, no watermark.",
  },
];

const STEPS = [
  {
    title: "Choose a template",
    text: "Pick from sales, restaurant, fuel, taxi, parking, hotel and more.",
    img: "step-01",
    alt: "A fanned stack of blank receipt templates, with the top one lifted to be chosen",
  },
  {
    title: "Customise it",
    text: "Add your logo, items, currency and tax. Watch the live preview update.",
    img: "step-02",
    alt: "A blank receipt lying flat with a stylus resting across it, fields being filled in",
  },
  {
    title: "Download or print",
    text: "Export a private PDF or PNG, or print — nothing leaves your browser.",
    img: "step-03",
    alt: "A finished receipt curling upward off the surface as it is exported",
  },
];

const STATS = [
  { value: "24+", label: "Receipt templates" },
  { value: "5", label: "Categories covered" },
  { value: "100%", label: "Runs in your browser" },
  { value: "$0", label: "Cost to use" },
];

const BRANDS = [
  { Icon: WalmartLogoIcon, name: "Walmart" },
  { Icon: AirbnbLogoIcon, name: "airbnb" },
  { Icon: AmazonLogoIcon, name: null },
  { Icon: UberLogoIcon, name: null },
  { Icon: StarbucksLogoIcon, name: "Starbucks" },
  { Icon: NikeLogoIcon, name: null },
  { Icon: AdidasLogoIcon, name: "Adidas" },
  { Icon: AppleLogoIcon, name: null },
  { Icon: JordanLogoIcon, name: null },
];

export default function Home() {
  const jsonLd = [
    websiteJsonLd(),
    webPageJsonLd({
      url: `${SITE_URL}/`,
      name: "Free Online Receipt Maker",
      description: SITE_DEFINITION,
      primaryImage: `${SITE_URL}/landing/hero-2000.webp`,
    }),
    softwareAppJsonLd(),
    orgJsonLd(),
    faqJsonLd(GENERAL_FAQS),
  ];

  return (
    <main className="bg-ink">
      <JsonLd data={jsonLd} />

      {/* ============================ HERO (dark) ============================ */}
      <section className="relative overflow-hidden bg-ink">
        {/* Atmospheric backdrop: layered radial washes rather than a stock photo,
            so there is no extra image request on the LCP path. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(166,169,235,0.20),transparent_65%)]" />
          <div className="absolute bottom-[-14rem] left-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_70%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-24 text-center sm:pt-32">
          <span
            className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-halo-200 backdrop-blur"
            style={{ animationDelay: "0ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Free · No watermark · Nothing uploaded
          </span>

          <h1
            className="mx-auto mt-7 max-w-4xl animate-fade-up font-display text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            {/* The explicit space matters: without it the <br/> makes crawlers
                and text extractors read the H1 as "simplereceipt". */}
            Radically simple{" "}
            <br />
            receipt maker
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-slate-400 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {SITE_DEFINITION}
          </p>

          <div
            className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/create"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-ink transition-colors hover:bg-halo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-halo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:w-auto"
            >
              Create a receipt
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/receipts"
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-halo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:w-auto"
            >
              Browse templates
            </Link>
          </div>

          {/* Hero artwork. Eager + high priority because this is the LCP element. */}
          <div
            className="relative mt-16 animate-fade-up"
            style={{ animationDelay: "320ms" }}
          >
            <img
              src="/landing/hero-1200.webp"
              srcSet="/landing/hero-1200.webp 1200w, /landing/hero-2000.webp 2000w"
              sizes="(max-width: 1024px) 100vw, 1024px"
              width={2000}
              height={1116}
              alt="Blank receipt papers and an invoice card floating in dark space, lit from above"
              fetchPriority="high"
              decoding="async"
              className="mx-auto w-full max-w-4xl select-none"
            />
            {/* Melt the artwork's lower edge into the section background. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-ink"
            />
          </div>

          {/* Brand wall */}
          <div className="mt-20">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-600">
              Templates styled after formats you know
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-45 grayscale transition duration-500 hover:opacity-70">
              {BRANDS.map(({ Icon, name }, i) => (
                <div key={i} className="flex select-none items-center gap-1.5 text-white">
                  <Icon className="h-5 w-auto" />
                  {name ? (
                    <span className="text-sm font-semibold tracking-tight">{name}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================= STATS BAND (dark) ========================= */}
      <section className="border-y border-white/[0.06] bg-ink-800">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-6 py-14 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1.5 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================== TEMPLATES (light) ======================== */}
      <section id="templates" className="bg-cream py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              Every kind of receipt, ready to go
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Twenty-four templates across five categories. Pick one, make it yours, and download
              in under a minute.{" "}
              <Link
                href="/receipts"
                className="font-medium text-ink underline decoration-slate-400 underline-offset-4 hover:decoration-ink"
              >
                See all receipt types
              </Link>
            </p>
          </Reveal>
          <div className="mt-12">
            <TemplateGrid />
          </div>
        </div>
      </section>

      {/* ============================ WHY (dark) ============================ */}
      <section className="bg-ink py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
              Built to stay out of your way
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
              A privacy-first alternative to dated receipt generators.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/[0.07] sm:grid-cols-2">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 80}>
                <div className="group h-full bg-ink-800 p-8 transition-colors hover:bg-ink-700">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-halo-300 transition-colors group-hover:bg-halo-400/15">
                    <w.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== HOW IT WORKS (light) ===================== */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              Three steps. Under a minute.
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <li className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
                  <img
                    src={`/landing/${s.img}-400.webp`}
                    srcSet={`/landing/${s.img}-400.webp 400w, /landing/${s.img}-800.webp 800w`}
                    sizes="(max-width: 640px) 100vw, 380px"
                    width={800}
                    height={597}
                    alt={s.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/2] w-full select-none border-b border-black/[0.04] object-cover"
                  />
                  <div className="p-8">
                    <span className="font-display text-sm font-semibold tabular-nums text-slate-400">
                      0{i + 1}
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-ink">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={280}>
            <ul className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-600">
              {["No account to preview", "No watermark", "Nothing uploaded"].map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-emerald-600" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ============================= FAQ (dark) ============================ */}
      <section className="bg-ink py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
              Frequently asked questions
            </h2>
            <div className="mt-10">
              <FaqList faqs={GENERAL_FAQS} dark />
            </div>
            <p className="mt-8 text-sm text-slate-500">
              More questions?{" "}
              <Link
                href="/faq"
                className="font-medium text-halo-300 underline decoration-halo-400/40 underline-offset-4 hover:decoration-halo-300"
              >
                Read the full FAQ
              </Link>
            </p>
            {/* Visible freshness signal, paired with dateModified in JSON-LD. */}
            <p className="mt-3 text-xs text-slate-600">
              Last reviewed{" "}
              <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED_DISPLAY}</time>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================ CLOSING CTA ============================ */}
      <section className="relative overflow-hidden bg-ink-800 py-24">
        {/* Painted as a CSS background rather than an <img>: it is pure texture
            with nothing to describe, so it should not appear in the document's
            image list at all. An <img alt=""> would be correct for screen
            readers but still shows up as a missing-alt warning in SEO crawlers. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/landing/cta-1600.webp')" }}
          />
          <div className="absolute left-1/2 top-1/2 h-[26rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(166,169,235,0.10),transparent_65%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            Make your first receipt now
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-400">
            Free to build and preview. Create a free account only when you want to download, print
            or save.
          </p>
          <Link
            href="/create"
            className="mt-9 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-ink transition-colors hover:bg-halo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-halo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-800"
          >
            Start creating
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
