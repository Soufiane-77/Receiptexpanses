"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { logIn, signInWithGoogle, signUp } from "@/lib/auth";
import { inputCls } from "./fields";

const OAUTH_ERRORS: Record<string, string> = {
  oauth: "Couldn't complete sign-in. Please try again.",
};

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(OAUTH_ERRORS[search.get("error") ?? ""] ?? "");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    if (mode === "signup") {
      const res = await signUp(name, email, password);
      setSubmitting(false);
      if (!res.ok) return setError(res.error);
      if (res.needsConfirmation) {
        return setNotice("Almost there — check your email to confirm your account, then log in.");
      }
      router.push(next);
    } else {
      const res = await logIn(email, password);
      setSubmitting(false);
      if (!res.ok) return setError(res.error);
      router.push(next);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setNotice("");
    const res = await signInWithGoogle(next);
    // On success the browser navigates to Google; only surface failures.
    if (!res.ok) setError(res.error);
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === "signup"
            ? "Save your receipts and download PDFs & PNGs — free."
            : "Sign in to your ReceiptExpenses dashboard."}
        </p>

        {notice ? <p className="mt-3 text-sm text-emerald-600">{notice}</p> : null}

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <GoogleMark className="h-4 w-4" />
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="flex flex-col gap-3">
          {mode === "signup" ? (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Name</span>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          ) : null}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Password</span>
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

        <button
          disabled={submitting}
          className="mt-5 w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-brand-600 hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" className="font-medium text-brand-600 hover:underline">
                Create an account
              </Link>
            </>
          )}
        </p>
        <p className="mt-4 text-center text-xs text-slate-400">
          Your account is secured with an encrypted session.
        </p>
      </form>
    </main>
  );
}

/** Google's multi-colour "G" mark. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
