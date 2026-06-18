import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Refund & Cancellation Policy — ReceiptExpenses" },
  description:
    "How ReceiptExpenses Pro subscriptions are billed, how to cancel, and when refunds are available.",
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Refund &amp; Cancellation Policy
      </h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: 2026</p>

      <div className="mt-6 flex flex-col gap-4 leading-relaxed text-slate-700">
        <p>
          This policy explains how billing, cancellations and refunds work for the
          ReceiptExpenses <strong>Pro</strong> subscription. By subscribing you agree to the terms
          below alongside our{" "}
          <Link href="/terms" className="font-medium text-brand-600 hover:underline">
            Terms of Use
          </Link>
          .
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Subscriptions &amp; billing</h2>
        <p>
          Pro is a recurring subscription billed monthly through our payment processor, Stripe. The
          price shown on the{" "}
          <Link href="/pricing" className="font-medium text-brand-600 hover:underline">
            Pricing
          </Link>{" "}
          page is charged at sign-up and again on the same day each billing cycle until you cancel.
          Building and previewing receipts is always free; a subscription is required to download,
          print or save them.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Cancelling</h2>
        <p>
          You can cancel at any time from your{" "}
          <Link href="/dashboard" className="font-medium text-brand-600 hover:underline">
            dashboard
          </Link>{" "}
          via the secure Stripe billing portal. When you cancel, your Pro access continues until the
          end of the current paid period and you will not be charged again. We do not lock you in —
          there is no cancellation fee.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Refunds</h2>
        <p>
          Because Pro immediately unlocks digital downloads, payments are generally non-refundable.
          As a goodwill gesture, we will refund your most recent charge if you request it within{" "}
          <strong>7 days</strong> of that charge and you have not yet exported or downloaded a
          receipt during the period. Refunds beyond this are at our reasonable discretion.
        </p>
        <p>
          Duplicate charges, charges after a confirmed cancellation, and verified billing errors are
          always refunded in full.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">How to request a refund</h2>
        <p>
          Email{" "}
          <a href="mailto:support@receiptexpenses.com" className="font-medium text-brand-600 hover:underline">
            support@receiptexpenses.com
          </a>{" "}
          from the address on your account and include the date of the charge. We aim to respond
          within 2 business days. If you believe you were charged in error, please contact us before
          opening a chargeback so we can resolve it quickly.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Questions</h2>
        <p>
          Anything unclear? Reach us via the{" "}
          <Link href="/contact" className="font-medium text-brand-600 hover:underline">
            contact page
          </Link>
          . Please review this policy against your local consumer-protection laws before relying on
          it commercially.
        </p>
      </div>
    </main>
  );
}
