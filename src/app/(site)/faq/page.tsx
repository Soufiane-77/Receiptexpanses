import type { Metadata } from "next";
import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import { ButtonLink } from "@/components/Button";
import { ArrowRightIcon } from "@/components/icons";
import { GENERAL_FAQS, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "FAQ — ReceiptExpenses Receipt Maker" },
  description:
    "Answers about ReceiptExpenses: what it costs, is my data private, what formats you can download, and what receipts you can make.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GENERAL_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
    url: `${SITE_URL}/faq`,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <JsonLd data={jsonLd} />
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Frequently asked questions</h1>
      <p className="mt-3 text-lg text-slate-600">
        Everything you need to know about making receipts with ReceiptExpenses.
      </p>
      <div className="mt-8">
        <FaqList faqs={GENERAL_FAQS} />
      </div>
      <div className="mt-10 rounded-2xl bg-slate-900 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Still have a question? Just try it.</h2>
        <p className="mt-2 text-slate-300">Building a receipt is free — subscribe to download it.</p>
        <ButtonLink href="/create" className="mt-4 px-6 py-3 text-base">
          Start creating
          <ArrowRightIcon className="h-5 w-5" />
        </ButtonLink>
      </div>
    </main>
  );
}
