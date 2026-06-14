"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { logIn, signUp } from "@/lib/auth";
import { inputCls } from "./fields";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = mode === "signup" ? signUp(name, email, password) : logIn(email, password);
    if (res.ok) {
      router.push(next);
    } else {
      setError(res.error);
    }
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
            ? "Save receipts, manage your subscription, and access your dashboard."
            : "Sign in to your ReceiptExpenses dashboard."}
        </p>

        <div className="mt-5 flex flex-col gap-3">
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

        <button className="mt-5 w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          {mode === "signup" ? "Create account" : "Log in"}
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
          Demo accounts are stored in your browser only.
        </p>
      </form>
    </main>
  );
}
