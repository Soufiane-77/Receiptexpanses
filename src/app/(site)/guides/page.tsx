import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { GUIDES } from "@/content/guides";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Receipt & Expense Guides — ReceiptExpenses" },
  description:
    "Plain-English guides to receipts, invoices and expense records: how to write a receipt, receipt vs invoice, replacing lost receipts for taxes, rent receipts by state, 1099 and gig-worker records, and more.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "" },
      { name: "Guides", path: "/guides" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Receipt & Expense Guides",
      url: `${SITE_URL}/guides`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: GUIDES.map((g, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/guides/${g.slug}`,
          name: g.title,
        })),
      },
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-14">
      <JsonLd data={jsonLd} />

      <nav className="text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-700">Home</Link>{" / "}
        <span className="text-slate-600">Guides</span>
      </nav>

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
        Receipt &amp; expense guides
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Clear, practical answers about receipts, invoices and expense records — for freelancers,
        gig workers, small businesses and anyone reconstructing a lost receipt for their own tax
        and reimbursement records.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-brand-300 hover:shadow-elevated"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
              {g.category}
            </span>
            <h2 className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-brand-600">
              {g.title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{g.tldr}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
