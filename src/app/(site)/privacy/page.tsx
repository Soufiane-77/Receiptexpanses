import type { Metadata } from "next";
import Link from "next/link";

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
          When you create an account we store your name, email address and a securely hashed
          password in our database (Cloudflare D1). A single secure, http-only session cookie keeps
          you signed in. We do not sell your personal data.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Payments</h2>
        <p>
          Subscriptions are processed by Stripe. Your card details are entered on Stripe&apos;s secure
          checkout and are never seen or stored by us — we only receive your subscription status. See
          the{" "}
          <Link href="/refund" className="font-medium text-brand-600 hover:underline">
            Refund &amp; Cancellation Policy
          </Link>{" "}
          for billing details.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Chat assistant</h2>
        <p>
          If you use the in-app chat assistant, the messages you send are processed by our AI
          provider to generate a reply. Please don&apos;t include sensitive personal information in
          chat messages.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Cookies</h2>
        <p>
          We use only an essential session cookie for sign-in, and store your drafts in your
          browser&apos;s local storage. Full details are in our{" "}
          <Link href="/cookies" className="font-medium text-brand-600 hover:underline">
            Cookie Policy
          </Link>
          .
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Logos and images</h2>
        <p>
          Any logo you upload is read locally and embedded into the receipt as a data URL. It is
          never uploaded to a third party.
        </p>

        <h2 className="mt-4 text-xl font-bold text-slate-900">Contact</h2>
        <p>
          Questions about privacy can be sent to{" "}
          <a
            href="mailto:support@receiptexpenses.com"
            className="font-medium text-brand-600 hover:underline"
          >
            support@receiptexpenses.com
          </a>{" "}
          or via our{" "}
          <Link href="/contact" className="font-medium text-brand-600 hover:underline">
            contact page
          </Link>
          . Please review this policy against the laws of your jurisdiction before relying on it
          commercially.
        </p>
      </div>
    </main>
  );
}
