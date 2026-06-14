import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Terms of Use — ReceiptExpenses" },
  description: "The terms governing your use of ReceiptExpenses, the free online receipt maker.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Terms of Use</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: 2026</p>

      <div className="mt-6 flex flex-col gap-4 leading-relaxed text-slate-700">
        <h2 className="mt-2 text-xl font-bold text-slate-900">Acceptable use</h2>
        <p>
          ReceiptExpenses is provided to help you create receipts for your <strong>own</strong>{" "}
          business, freelancing or personal record-keeping. You agree not to use it to commit fraud,
          to impersonate real named businesses or retailers, or for any unlawful purpose. You are
          solely responsible for the content of the receipts you create and how you use them.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">No warranty</h2>
        <p>
          The service is provided “as is” without warranties of any kind. We do not guarantee that
          generated documents meet any particular legal or tax requirement in your jurisdiction.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, ReceiptExpenses and its operators are not liable for
          any damages arising from your use of the service or the documents you create with it.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Changes</h2>
        <p>
          These terms may be updated over time. This is a template; adapt it with appropriate legal
          advice before operating ReceiptExpenses as a public service.
        </p>
      </div>
    </main>
  );
}
