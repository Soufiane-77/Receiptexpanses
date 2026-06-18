import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Cookie Policy — ReceiptExpenses" },
  description:
    "Which cookies and local storage ReceiptExpenses uses, why, and how to control them.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Cookie Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: 2026</p>

      <div className="mt-6 flex flex-col gap-4 leading-relaxed text-slate-700">
        <p>
          This page explains the cookies and similar browser storage ReceiptExpenses uses. We keep
          this to the minimum needed to run the service.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Strictly necessary</h2>
        <p>
          When you sign in, we set a single secure, http-only session cookie so we can keep you
          logged in. It contains an opaque session identifier — not your password or personal
          details — and is required for accounts and subscriptions to work. It cannot be turned off
          without breaking sign-in.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Preferences (local storage)</h2>
        <p>
          Your receipt drafts, saved receipts and editor settings are kept in your browser&apos;s
          local storage on your own device. This is not a tracking cookie and never leaves your
          browser; clearing your site data removes it.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Payments</h2>
        <p>
          When you start a subscription you are taken to Stripe&apos;s secure checkout. Stripe sets
          its own cookies to process the payment and prevent fraud, governed by Stripe&apos;s privacy
          policy.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Analytics</h2>
        <p>
          If we enable privacy-respecting analytics or advertising measurement in the future, this
          section and our consent controls will be updated to describe exactly what is collected. We
          will ask for consent where the law requires it (for example, visitors in the EEA and UK).
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Managing cookies</h2>
        <p>
          You can clear or block cookies and site data from your browser settings at any time. Note
          that blocking the session cookie will prevent you from signing in. For more on how we
          handle data, see our{" "}
          <Link href="/privacy" className="font-medium text-brand-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
