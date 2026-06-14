"use client";

import { useEffect } from "react";
import { AlertTriangleIcon } from "@/components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app this would report to an error tracker.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <AlertTriangleIcon className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-slate-500">
        An unexpected error occurred. You can try again — your saved work in this browser is
        untouched.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Try again
      </button>
    </main>
  );
}
