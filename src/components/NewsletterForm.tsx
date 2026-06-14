"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/auth";
import { subscribeNewsletter } from "@/lib/subscription";
import { inputCls } from "./fields";

export default function NewsletterForm() {
  const user = useCurrentUser();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.email) setEmail((e) => e || user.email);
    if (user?.blogSubscribed) setDone(true);
  }, [user]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const isCurrent = !!user && user.email.toLowerCase() === email.trim().toLowerCase();
    const ok = subscribeNewsletter(email, isCurrent);
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setDone(true);
    if (!ok) setError("You're already subscribed — thanks!");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6">
      <h3 className="text-lg font-bold text-slate-900">Subscribe to the blog</h3>
      <p className="mt-1 text-sm text-slate-600">
        Receipt tips, freelancing how-tos, and product updates. No spam.
      </p>
      {done && !error ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✓ You're subscribed. Thanks for joining!
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            placeholder="you@example.com"
            className={`${inputCls} flex-1`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Subscribe
          </button>
        </form>
      )}
      {error ? <p className="mt-2 text-sm text-amber-600">{error}</p> : null}
    </div>
  );
}
