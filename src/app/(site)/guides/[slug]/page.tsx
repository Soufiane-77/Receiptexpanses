import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import PostBody from "@/components/PostBody";
import { ButtonLink } from "@/components/Button";
import TemplateIcon from "@/components/TemplateIcon";
import { ArrowRightIcon, SparklesIcon } from "@/components/icons";
import { GUIDES, getGuide } from "@/content/guides";
import { guideFaqs } from "@/lib/guides";
import { getTemplate, templateSlug } from "@/templates/registry";
import {
  SITE_URL,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
} from "@/lib/seo";

const KNOWN = new Set(GUIDES.map((g) => g.slug));

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return { title: "Guide not found" };
  return {
    title: { absolute: g.metaTitle },
    description: g.metaDescription,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: {
      title: g.metaTitle,
      description: g.metaDescription,
      url: `${SITE_URL}/guides/${g.slug}`,
      type: "article",
      images: ["/og.png"],
    },
  };
}

function fmtDate(iso: string): string {
  // Deterministic, locale-stable formatting (no runtime Intl surprises across envs).
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  if (!y || !m || !d) return iso;
  return `${months[m - 1]} ${d}, ${y}`;
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!KNOWN.has(slug)) notFound();
  const g = getGuide(slug)!;
  const url = `${SITE_URL}/guides/${g.slug}`;
  const faqs = guideFaqs(g);

  const relatedGuides = (g.relatedGuides ?? [])
    .map((s) => getGuide(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x) && x!.slug !== g.slug);
  const relatedTemplates = (g.relatedTemplates ?? [])
    .map((id) => getTemplate(id))
    .filter((t) => Boolean(t));

  const jsonLd: Record<string, unknown>[] = [
    articleJsonLd({
      headline: g.title,
      description: g.metaDescription,
      url,
      datePublished: g.datePublished,
      dateModified: g.dateModified,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "" },
      { name: "Guides", path: "/guides" },
      { name: g.title, path: `/guides/${g.slug}` },
    ]),
  ];
  if (faqs.length) jsonLd.push(faqJsonLd(faqs, url));
  if (g.howToSteps?.length) {
    jsonLd.push(
      howToJsonLd({
        name: g.title,
        description: g.tldr,
        url,
        steps: g.howToSteps,
      })
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={jsonLd} />

      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-700">Home</Link>{" / "}
        <Link href="/guides" className="hover:text-slate-700">Guides</Link>{" / "}
        <span className="text-slate-600">{g.title}</span>
      </nav>

      <header className="mt-6">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
          {g.category}
        </span>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{g.title}</h1>
        <p className="mt-3 text-sm text-slate-400">
          Last updated {fmtDate(g.dateModified)}
        </p>
      </header>

      {/* TL;DR — answer-first callout */}
      <aside className="mt-6 flex gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5">
        <SparklesIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" />
        <p className="text-sm leading-relaxed text-slate-700">
          <strong className="font-semibold text-slate-900">TL;DR:</strong> {g.tldr}
        </p>
      </aside>

      {/* Body */}
      <article>
        <PostBody body={g.body} />
      </article>

      {/* Related templates */}
      {relatedTemplates.length ? (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-slate-900">Related receipt templates</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {relatedTemplates.map((t) => (
              <Link
                key={t.id}
                href={`/${templateSlug(t)}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-brand-300 hover:shadow-elevated"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <TemplateIcon id={t.id} className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-slate-800 group-hover:text-brand-600">
                  {t.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Related guides */}
      {relatedGuides.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-900">Keep reading</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {relatedGuides.map((r) => (
              <li key={r.slug}>
                <Link href={`/guides/${r.slug}`} className="font-medium text-brand-600 hover:underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Bottom CTA */}
      <section className="mt-14 rounded-2xl bg-slate-900 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Make a receipt in under a minute</h2>
        <p className="mt-2 text-slate-300">
          Free, private, and ready in seconds — build and preview with no account.
        </p>
        <ButtonLink href="/create" className="mt-4 px-6 py-3 text-base">
          Start creating
          <ArrowRightIcon className="h-5 w-5" />
        </ButtonLink>
      </section>
    </main>
  );
}
