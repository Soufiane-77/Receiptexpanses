import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: { absolute: "Contact — ReceiptExpenses" },
  description: "Get in touch with the ReceiptExpenses team for support, billing or feedback.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Contact us</h1>
      <p className="mt-3 text-lg text-slate-600">
        Questions, billing help, or feedback — we&apos;re happy to hear from you.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Support &amp; billing</h2>
          <p className="mt-1 text-sm text-slate-500">
            Account, subscription or refund questions. We aim to reply within 2 business days.
          </p>
          <a
            href="mailto:support@receiptexpenses.com"
            className="mt-3 inline-block font-medium text-brand-600 hover:underline"
          >
            support@receiptexpenses.com
          </a>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Quick answers</h2>
          <p className="mt-1 text-sm text-slate-500">
            Many questions are answered instantly in our FAQ, or ask the in-app chat assistant in the
            corner of any page.
          </p>
          <Link href="/faq" className="mt-3 inline-block font-medium text-brand-600 hover:underline">
            Read the FAQ →
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-slate-900 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Ready to make a receipt?</h2>
        <p className="mt-2 text-slate-300">Build and preview for free — subscribe to download.</p>
        <ButtonLink href="/create" className="mt-4 px-6 py-3 text-base">
          Start creating
          <ArrowRightIcon className="h-5 w-5" />
        </ButtonLink>
      </div>
    </main>
  );
}
