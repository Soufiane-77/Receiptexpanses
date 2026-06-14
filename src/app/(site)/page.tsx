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
} from "@/components/icons";
import { GENERAL_FAQS, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Free Online Receipt Maker — Create & Download Receipts | ReceiptExpenses" },
  description:
    "ReceiptExpenses is a free online receipt maker. Pick a template, fill in your details, preview live, and download a PDF or PNG receipt. Private — everything runs in your browser.",
  alternates: { canonical: "/" },
};

const TRUST = ["100% in your browser", "No sign-up required", "PDF & PNG export"];

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
    text: "Export a pixel-perfect PDF or PNG, or print straight from your browser. Pro removes the watermark.",
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
        "Free online receipt maker. Pick a template, fill in your details, preview live, and download a PDF or PNG receipt.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
            Free, private receipt generator
          </span>
          <h1
            className="mx-auto mt-5 max-w-3xl animate-fade-up text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Free online receipt maker
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl animate-fade-up text-lg text-slate-600"
            style={{ animationDelay: "160ms" }}
          >
            Pick a template, fill in your business and items, watch it build live, then download a
            pixel-perfect PDF or PNG. Everything runs in your browser — nothing is uploaded.
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
            {/* Walmart Logo */}
            <div className="flex items-center gap-1 select-none">
              <svg className="h-5 w-5 text-[#0071CE]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0h1v8h-1zm0 16h1v8h-1zm-6-2h8v1H6zm-4.24-6.42 5.66 5.66-.71.71-5.66-5.66zm15.56 15.56 5.66 5.66-.71.71-5.66-5.66zM2.05 17.66l5.66-5.66.71.71-5.66 5.66zm15.56-15.56 5.66-5.66.71.71-5.66 5.66z" />
              </svg>
              <span className="font-bold text-slate-800 text-sm tracking-tight">Walmart</span>
            </div>
            {/* Airbnb Logo */}
            <div className="flex items-center gap-1 select-none">
              <svg className="h-5 w-5 text-[#FF5A5F]" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 1c-2 0-3.7 1.1-4.6 2.8L2.7 20c-.9 1.6-.9 3.6 0 5.2.9 1.6 2.6 2.8 4.6 2.8h17.4c2 0 3.7-1.1 4.6-2.8.9-1.6.9-3.6 0-5.2L20.6 3.8C19.7 2.1 18 1 16 1zm0 4c1 0 1.9.5 2.4 1.3l8.7 16.2c.4.8.4 1.8 0 2.6-.4.8-1.3 1.3-2.4 1.3H7.3c-1.1 0-2-.5-2.4-1.3-.4-.8-.4-1.8 0-2.6L13.6 6.3C14.1 5.5 15 5 16 5zm0 6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 2.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5z" />
              </svg>
              <span className="font-bold text-slate-800 text-sm tracking-tight">airbnb</span>
            </div>
            {/* Amazon Logo */}
            <div className="flex flex-col items-center select-none">
              <span className="font-extrabold text-slate-800 text-sm tracking-tight leading-none">amazon</span>
              <svg className="h-2 w-10 text-[#FF9900]" viewBox="0 0 40 8" fill="currentColor">
                <path d="M1 2 Q20 8 39 2 Q20 5 1 2" />
              </svg>
            </div>
            {/* Uber Logo */}
            <div className="flex items-center select-none">
              <span className="font-extrabold tracking-widest text-slate-900 text-sm uppercase">Uber</span>
            </div>
            {/* Starbucks Logo */}
            <div className="flex items-center gap-1 select-none">
              <svg className="h-5 w-5 text-[#00704A]" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="8" fill="currentColor" />
                <circle cx="12" cy="11.5" r="2.5" fill="white" />
                <path d="M8 17c1.5-2 3.5-3 4-3s2.5 1 4 3" stroke="white" strokeWidth="1" fill="none" />
              </svg>
              <span className="font-bold text-slate-800 text-sm tracking-tight">Starbucks</span>
            </div>
            {/* Target Logo */}
            <div className="flex items-center gap-1 select-none">
              <svg className="h-5 w-5 text-[#CC0000]" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" fill="white" />
                <circle cx="12" cy="12" r="3.5" />
              </svg>
              <span className="font-bold text-[#CC0000] text-sm tracking-tight uppercase">Target</span>
            </div>
            {/* Costco Logo */}
            <div className="flex flex-col items-start leading-none select-none">
              <span className="font-black text-[#E31B23] text-sm tracking-tighter italic uppercase">Costco</span>
              <span className="text-[5px] text-[#005A9C] uppercase tracking-[0.2em] font-bold">wholesale</span>
            </div>
          </div>
        </div>
      </section>

      {/* Template grid */}
      <section id="templates" className="mx-auto max-w-6xl px-4 pb-16">
        <Reveal>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Choose a template</h2>
          <p className="mb-6 text-slate-600">
            Twenty receipt types across five categories — including Airbnb, Walmart, Amazon, Uber &amp; Starbucks.{" "}
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
