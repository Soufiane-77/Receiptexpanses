import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy — ReceiptExpenses" },
  description:
    "ReceiptExpenses runs in your browser and does not upload your receipts. Read how your data is handled.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: 2026</p>

      <div className="mt-6 flex flex-col gap-4 leading-relaxed text-slate-700">
        <p>
          ReceiptExpenses is designed to be private by default. This page explains, in plain language,
          what happens to your data.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Receipt content stays on your device</h2>
        <p>
          The receipts you create — including business details, logos and line items — are processed
          entirely in your browser. They are not transmitted to or stored on our servers. Drafts and
          saved receipts are kept in your browser's local storage so they persist between visits on
          that device.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Accounts</h2>
        <p>
          In this version, accounts and subscription state are stored locally in your browser for
          demonstration purposes. No payment information is collected. If you deploy ReceiptExpenses
          with a real backend, this section should be updated to describe that service.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Logos and images</h2>
        <p>
          Any logo you upload is read locally and embedded into the receipt as a data URL. It is
          never uploaded to a third party.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Contact</h2>
        <p>
          Questions about privacy can be directed to the site operator. This is a template policy —
          adapt it to your jurisdiction and actual data practices before going live.
        </p>
      </div>
    </main>
  );
}
