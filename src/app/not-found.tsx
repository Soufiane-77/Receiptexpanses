import Link from "next/link";
import { FileSearchIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <FileSearchIcon className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-500">
        We couldn't find that page. It may have moved, or the link might be wrong.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Go home
        </Link>
        <Link
          href="/create"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
        >
          Make a receipt
        </Link>
      </div>
    </main>
  );
}
