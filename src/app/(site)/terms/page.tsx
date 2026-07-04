import type { Metadata } from "next";
import LegalDisclaimer from "@/components/LegalDisclaimer";

export const metadata: Metadata = {
  title: { absolute: "Terms of Use — ReceiptExpenses" },
  description: "The terms governing your use of ReceiptExpenses, the online receipt maker.",
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

        <div className="my-2">
          <LegalDisclaimer />
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Brand-style templates</h2>
        <p>
          Some templates are styled after the general look of receipts from well-known companies
          (for example Apple, Nike, Jordan, Uber, Walmart, Amazon and Starbucks). These templates
          are independent and customizable; ReceiptExpenses is not affiliated with, endorsed by, or
          connected to any of these companies, and no trademark or logo of theirs is reproduced. They
          exist only to help you reconstruct a replacement expense record for a genuine purchase you
          made. Using them to fabricate proof of a purchase that did not happen, or to deceive a
          retailer, employer, insurer or any third party, is a violation of these terms.
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
