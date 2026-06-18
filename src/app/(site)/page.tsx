import type { Metadata } from "next";
import Link from "next/link";
import TemplateGrid from "@/components/TemplateGrid";
import { ButtonLink } from "@/components/Button";
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
import { GENERAL_FAQS, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Online Receipt Maker — Create & Download | ReceiptExpenses" },
  description:
    "Online receipt maker — pick a template for Walmart, Airbnb, Uber, Nike, Apple and more. Fill in details, and preview free. Subscribe to download a PDF or PNG.",
  alternates: { canonical: "/" },
};

const TRUST = ["100% in your browser", "Free live preview", "Cancel anytime"];

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
    text: "Subscribe to export a pixel-perfect PDF or PNG, or print straight from your browser — no watermark.",
  },
];

const STEPS = [
  { title: "Choose a template", text: "Pick from sales, restaurant, fuel, taxi, parking, hotel and more." },
  { title: "Customise it", text: "Add your logo, items, currency and tax. Watch the live preview update." },
  { title: "Download or print", text: "Export a private PDF or PNG, or print — nothing leaves your browser." },
];

export default function Home() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Online receipt maker. Pick a template, fill in your details, preview live, and subscribe to download a PDF or PNG receipt.",
      offers: { "@type": "Offer", price: "6", priceCurrency: "USD" },
    },
    { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: GENERAL_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <main>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated gradient backdrop (decorative) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl animate-blob" />
          <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl animate-blob [animation-delay:4s]" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl animate-blob [animation-delay:8s]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <span
            className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand-100 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 backdrop-blur"
            style={{ animationDelay: "0ms" }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Private receipt generator — preview free
          </span>
          <h1
            className="mx-auto mt-5 max-w-3xl animate-fade-up text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Online receipt maker
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl animate-fade-up text-lg text-slate-600"
            style={{ animationDelay: "160ms" }}
          >
            Pick a template, fill in your business and items, and watch it build live for free.
            Subscribe to download a pixel-perfect PDF or PNG. Everything runs in your browser —
            nothing is uploaded.
          </p>
          <div
            className="mt-8 flex animate-fade-up flex-col justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <ButtonLink href="/create" size="md" className="px-6 py-3 text-base">
              Start creating
              <ArrowRightIcon className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="#templates" variant="secondary" size="md" className="px-6 py-3 text-base">
              Browse templates
            </ButtonLink>
          </div>
          <ul
            className="mx-auto mt-8 flex max-w-2xl animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500"
            style={{ animationDelay: "320ms" }}
          >
            {TRUST.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-brand-600" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Brand styles showcase */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Generate receipts matching the style of your favorite U.S. companies
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-60 grayscale transition-all duration-300 hover:opacity-90 hover:grayscale-0">
            <div className="flex items-center gap-1 select-none">
              <WalmartLogoIcon className="h-5 w-5 text-[#0071CE]" />
              <span className="font-bold text-slate-800 text-sm tracking-tight">Walmart</span>
            </div>
            <div className="flex items-center gap-1 select-none">
              <AirbnbLogoIcon className="h-5 w-5 text-[#FF5A5F]" />
              <span className="font-bold text-slate-800 text-sm tracking-tight">airbnb</span>
            </div>
            <div className="flex flex-col items-center select-none">
              <AmazonLogoIcon className="h-6 text-[#FF9900]" />
            </div>
            <div className="flex items-center select-none">
              <UberLogoIcon className="h-5 text-slate-900" />
            </div>
            <div className="flex items-center gap-1 select-none">
              <StarbucksLogoIcon className="h-6 w-6 text-[#00704A]" />
              <span className="font-bold text-slate-800 text-sm tracking-tight">Starbucks</span>
            </div>
            <div className="flex items-center gap-1 select-none">
              <NikeLogoIcon className="h-5 text-[#111111]" />
              <span className="font-bold text-slate-800 text-sm tracking-tight uppercase">Nike</span>
            </div>
            <div className="flex items-center gap-1 select-none">
              <AdidasLogoIcon className="h-5 text-[#000000]" />
              <span className="font-bold text-slate-800 text-sm tracking-tight">Adidas</span>
            </div>
            <div className="flex items-center gap-1 select-none">
              <AppleLogoIcon className="h-5 text-[#000000]" />
              <span className="font-bold text-slate-800 text-sm tracking-tight">Apple</span>
            </div>
            <div className="flex items-center gap-1 select-none">
              <JordanLogoIcon className="h-6 text-[#E32636]" />
              <span className="font-bold text-slate-800 text-sm tracking-tight uppercase">Jordan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Template grid */}
      <section id="templates" className="mx-auto max-w-6xl px-4 pb-16">
        <Reveal>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Choose a template</h2>
          <p className="mb-6 text-slate-600">
            Twenty-four receipt types across five categories — including Airbnb, Walmart, Amazon, Uber, Nike &amp; Apple.{" "}
            <Link href="/receipts" className="font-medium text-brand-600 hover:underline">
              See all receipt types →
            </Link>
          </p>
        </Reveal>
        <TemplateGrid />
      </section>

      {/* Why ReceiptExpenses */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-slate-900">Why ReceiptExpenses</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              A modern, privacy-first alternative to dated receipt generators.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 90}>
                <div className="group rounded-2xl p-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:-translate-y-1 group-hover:bg-brand-100">
                    <w.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{w.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
            <div className="mt-6">
              <FaqList faqs={GENERAL_FAQS} />
            </div>
            <p className="mt-6 text-sm text-slate-500">
              More questions? Visit the{" "}
              <Link href="/faq" className="font-medium text-brand-600 hover:underline">
                full FAQ
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
