import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATES, getTemplate } from "@/templates/registry";
import { ButtonLink } from "@/components/Button";
import TemplateIcon from "@/components/TemplateIcon";
import JsonLd from "@/components/JsonLd";
import { ArrowRightIcon, CheckIcon, EyeIcon, ShieldIcon, ZapIcon } from "@/components/icons";
import { SITE_URL, faqsForType } from "@/lib/seo";

const KNOWN = new Set(TEMPLATES.map((t) => t.id));

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!KNOWN.has(slug)) return { title: "Receipt type not found" };
  const t = getTemplate(slug);
  const title = `${t.name} Maker — Free Online ${titleCase(t.seo.keyword)} Generator`;
  return {
    title,
    description: t.seo.blurb,
    keywords: [
      `${t.seo.keyword} maker`,
      `${t.seo.keyword} generator`,
      `free ${t.seo.keyword}`,
      `online ${t.seo.keyword}`,
      "receipt maker",
    ],
    alternates: { canonical: `/receipts/${t.id}` },
    openGraph: {
      title,
      description: t.seo.blurb,
      url: `${SITE_URL}/receipts/${t.id}`,
      type: "website",
    },
  };
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

const STEPS = [
  { icon: EyeIcon, title: "Choose & fill", text: "Start from the template and enter your business and line items." },
  { icon: ZapIcon, title: "Preview live", text: "The receipt updates with every keystroke — no guesswork." },
  { icon: ShieldIcon, title: "Download", text: "Export a private PDF or PNG, or print. Nothing is uploaded." },
];

export default async function ReceiptTypePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!KNOWN.has(slug)) notFound();
  const t = getTemplate(slug);
  const faqs = faqsForType(t.name, t.seo.keyword);
  const related = TEMPLATES.filter((x) => x.id !== t.id && x.category === t.category).slice(0, 3);
  const fallbackRelated = related.length
    ? related
    : TEMPLATES.filter((x) => x.id !== t.id).slice(0, 3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: `${t.name} Maker`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: t.seo.blurb,
      url: `${SITE_URL}/receipts/${t.id}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Receipt types", item: `${SITE_URL}/receipts` },
        { "@type": "ListItem", position: 3, name: t.name, item: `${SITE_URL}/receipts/${t.id}` },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <JsonLd data={jsonLd} />

      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-700">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/receipts" className="hover:text-slate-700">
          Receipt types
        </Link>{" "}
        / <span className="text-slate-600">{t.name}</span>
      </nav>

      {/* Hero */}
      <section className="mt-6 grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <span className="flex items-center gap-2">
            <span
              className="text-xs font-medium uppercase tracking-wide"
              style={t.brandColor ? { color: t.brandColor } : undefined}
            >
              {t.category}
            </span>
            {t.brandLabel ? (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: t.brandColor }}
              >
                {t.brandLabel}
              </span>
            ) : null}
          </span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Free {t.name} Maker
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">{t.seo.blurb}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={`/create?template=${t.id}`} className="px-6 py-3 text-base">
              Make a {t.seo.keyword}
              <ArrowRightIcon className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="/receipts" variant="secondary" className="px-6 py-3 text-base">
              All receipt types
            </ButtonLink>
          </div>
        </div>
        <div
          className={`hidden h-40 w-40 items-center justify-center rounded-3xl md:flex ${
            t.brandColor ? "" : "bg-gradient-to-br from-brand-50 to-slate-50 text-brand-600"
          }`}
          style={
            t.brandColor
              ? { backgroundColor: `${t.brandColor}18`, color: t.brandColor }
              : undefined
          }
        >
          <TemplateIcon id={t.id} className="h-20 w-20" />
        </div>
      </section>

      {/* How it works */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-slate-900">How to make a {t.seo.keyword}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-slate-900">What you can use it for</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {t.seo.useCases.map((u) => (
            <li key={u} className="flex items-start gap-2 text-slate-600">
              <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
              {u}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-slate-900">{t.name} FAQ</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-900">
                {f.q}
                <span className="text-slate-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold text-slate-900">Related receipt makers</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {fallbackRelated.map((r) => (
            <Link
              key={r.id}
              href={`/receipts/${r.id}`}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-brand-300 hover:shadow-elevated"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <TemplateIcon id={r.id} className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-slate-800 group-hover:text-brand-600">
                {r.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-14 rounded-2xl bg-slate-900 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Make your {t.seo.keyword} now</h2>
        <p className="mt-2 text-slate-300">Free, private, and ready in under a minute.</p>
        <ButtonLink href={`/create?template=${t.id}`} className="mt-4 px-6 py-3 text-base">
          Start creating
          <ArrowRightIcon className="h-5 w-5" />
        </ButtonLink>
      </section>
    </main>
  );
}
