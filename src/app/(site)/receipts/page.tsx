import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, TEMPLATES } from "@/templates/registry";
import TemplateIcon from "@/components/TemplateIcon";
import { ArrowRightIcon } from "@/components/icons";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Receipt Types — Free Receipt Maker for Every Kind of Receipt",
  description:
    "Browse every receipt type ReceiptExpenses can make: sales, restaurant, café, grocery, fuel, taxi, parking, hotel and more. Pick one and generate a free PDF or PNG receipt.",
  alternates: { canonical: "/receipts" },
  openGraph: {
    title: "Receipt Types — ReceiptExpenses",
    description: "Free receipt makers for sales, restaurant, fuel, taxi, parking, hotel and more.",
    url: `${SITE_URL}/receipts`,
  },
};

export default function ReceiptsIndex() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Every kind of receipt, made free
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Choose a receipt type below to learn how it works and generate one in seconds — itemized,
          branded with your logo, and exportable to PDF or PNG. Everything runs in your browser.
        </p>
      </header>

      {CATEGORIES.map((cat) => {
        const items = TEMPLATES.filter((t) => t.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mb-10">
            <h2 className="mb-4 text-xl font-bold text-slate-900">{cat}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => (
                <Link
                  key={t.id}
                  href={`/receipts/${t.id}`}
                  className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-elevated"
                >
                  <span
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${
                      t.brandColor ? "" : "bg-brand-50 text-brand-600"
                    }`}
                    style={
                      t.brandColor
                        ? { backgroundColor: `${t.brandColor}18`, color: t.brandColor }
                        : undefined
                    }
                  >
                    <TemplateIcon id={t.id} className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="flex items-center gap-2">
                      <span className="block font-semibold text-slate-900 group-hover:text-brand-600">
                        {t.name}
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
                    <span className="mt-0.5 block text-sm text-slate-500">{t.description}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                      Learn more
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
