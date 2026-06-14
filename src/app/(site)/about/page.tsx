import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: { absolute: "About ReceiptExpenses — A Private, Modern Receipt Maker" },
  description:
    "ReceiptExpenses is a free, privacy-first online receipt maker that runs entirely in your browser. Learn what it's for and how it's different.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">About ReceiptExpenses</h1>
      <div className="mt-6 flex flex-col gap-4 leading-relaxed text-slate-700">
        <p>
          ReceiptExpenses is a free online receipt maker built around two ideas: it should be{" "}
          <strong>fast</strong> and it should be <strong>private</strong>. You pick a template, fill
          in your details, and watch the receipt build live — then download a PDF or PNG, or print.
        </p>
        <p>
          Unlike many receipt tools, ReceiptExpenses runs <strong>entirely in your browser</strong>.
          Your business name, logo and line items never travel to a server, so your records stay
          yours. Logos are kept locally as data URLs and the only thing that leaves your device is
          the file you choose to download.
        </p>
        <h2 className="mt-4 text-xl font-bold text-slate-900">What it's for</h2>
        <p>
          ReceiptExpenses is intended for generating receipts for your <strong>own</strong> business,
          freelancing, or personal record-keeping — for example, reconstructing a lost receipt of a
          real purchase, or issuing proof of payment to a client. Our templates are deliberately
          generic and brandable so you supply your own business identity. Please don't use it to
          impersonate real named retailers.
        </p>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Free and Pro</h2>
        <p>
          Creating, previewing and downloading receipts is free. A Pro plan removes the small export
          watermark and unlocks unlimited saved receipts on your dashboard.
        </p>
      </div>
      <div className="mt-10">
        <ButtonLink href="/create" className="px-6 py-3 text-base">
          Make a receipt
          <ArrowRightIcon className="h-5 w-5" />
        </ButtonLink>
      </div>
    </main>
  );
}
