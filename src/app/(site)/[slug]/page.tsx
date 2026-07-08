import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TEMPLATES,
  TEMPLATE_SLUGS,
  getTemplateBySlug,
  templateSlug,
} from "@/templates/registry";
import { ButtonLink } from "@/components/Button";
import TemplateIcon from "@/components/TemplateIcon";
import JsonLd from "@/components/JsonLd";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { ArrowRightIcon, CheckIcon, EyeIcon, ShieldIcon, ZapIcon } from "@/components/icons";
import {
  SITE_URL,
  breadcrumbJsonLd,
  faqJsonLd,
  faqsForType,
  howToJsonLd,
  softwareAppJsonLd,
} from "@/lib/seo";

// Only the known template slugs render here; every other single-segment path
// falls through to a 404 (explicit routes like /about, /faq always win).
export const dynamicParams = false;

export function generateStaticParams() {
  return TEMPLATE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplateBySlug(slug);
  if (!t) return { title: "Receipt type not found" };
  const title = `${t.name} Maker — Online ${titleCase(t.seo.keyword)} Generator`;
  return {
    title,
    description: t.seo.blurb,
    keywords: [
      `${t.seo.keyword} maker`,
      `${t.seo.keyword} generator`,
      `${t.seo.keyword} template`,
      `online ${t.seo.keyword}`,
      "receipt maker",
      // High-intent recovery phrasing so answer engines match "lost receipt" queries.
      ...(t.brandLabel
        ? [`lost ${t.seo.keyword} replacement`, `${t.seo.keyword} reconstruction`]
        : ["lost receipt reconstruction"]),
    ],
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title,
      description: t.seo.blurb,
      url: `${SITE_URL}/${slug}`,
      type: "website",
      images: ["/og.png"],
    },
  };
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Steps are keyword-aware so the on-page text matches the HowTo schema exactly. */
function stepsForKeyword(keyword: string) {
  return [
    {
      icon: EyeIcon,
      title: "Choose & fill",
      text: `Open the ${keyword} template and enter your business name, line items, currency and tax in the form.`,
    },
    {
      icon: ZapIcon,
      title: "Preview live",
      text: `Watch the ${keyword} build in real time — every keystroke updates the preview, so what you see is what you get.`,
    },
    {
      icon: ShieldIcon,
      title: "Download",
      text: "Export a private PDF or PNG, or print. Nothing is uploaded to a server.",
    },
  ];
}

export default async function TemplateLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = getTemplateBySlug(slug);
  if (!t) notFound();
  const faqs = faqsForType(t.name, t.seo.keyword, t.brandLabel);
  const steps = stepsForKeyword(t.seo.keyword);
  const pageUrl = `${SITE_URL}/${slug}`;
  const editorHref = `/create/${t.id}`;
  const related = TEMPLATES.filter((x) => x.id !== t.id && x.category === t.category).slice(0, 3);
  const fallbackRelated = related.length
    ? related
    : TEMPLATES.filter((x) => x.id !== t.id).slice(0, 3);

  const jsonLd = [
    softwareAppJsonLd({
      name: `${t.name} Maker`,
      description: t.seo.blurb,
      url: pageUrl,
    }),
    howToJsonLd({
      name: `How to make a ${t.seo.keyword}`,
      description: `Create a ${t.seo.keyword} online with the ReceiptExpenses ${t.name} template — fill in your details, preview live, and download a PDF or PNG.`,
      url: pageUrl,
      totalTime: "PT2M",
      steps: steps.map((s) => ({ name: s.title, text: s.text })),
    }),
    faqJsonLd(faqs, pageUrl),
    breadcrumbJsonLd([
      { name: "Home", path: "" },
      { name: "Receipt types", path: "/receipts" },
      { name: t.name, path: `/${slug}` },
    ]),
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
            {t.name} Maker
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">{t.seo.blurb}</p>
          {t.brandLabel ? (
            <p className="mt-3 max-w-xl text-sm text-slate-500">
              This customizable {t.seo.keyword} template is for freelancers, contractors and business
              owners who need to reconstruct a replacement record or itemized expense receipt for a{" "}
              {t.brandLabel}-style purchase they actually made — to submit for reimbursement or tax
              deductions. It is an independent template and generator, <strong>not affiliated with{" "}
              {t.brandLabel}</strong>.
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={editorHref} className="px-6 py-3 text-base">
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
        <ol className="mt-6 grid gap-5 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={i}
              id={`step-${i + 1}`}
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{s.text}</p>
            </li>
          ))}
        </ol>
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

      {/* Legal disclaimer — brand pages only */}
      {t.brandLabel ? (
        <section className="mt-14">
          <LegalDisclaimer brandLabel={t.brandLabel} />
        </section>
      ) : null}

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
              href={`/${templateSlug(r)}`}
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
        <p className="mt-2 text-slate-300">Free, private, and ready in under a minute — download with a free account.</p>
        <ButtonLink href={editorHref} className="mt-4 px-6 py-3 text-base">
          Start creating
          <ArrowRightIcon className="h-5 w-5" />
        </ButtonLink>
      </section>
    </main>
  );
}
