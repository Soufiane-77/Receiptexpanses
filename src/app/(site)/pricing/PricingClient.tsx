"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth";
import { PLANS, cancelPro, subscribePro } from "@/lib/subscription";
import { Button } from "@/components/Button";
import { CheckIcon, SparklesIcon } from "@/components/icons";

export default function PricingClient() {
  const user = useCurrentUser();
  const router = useRouter();
  const [notice, setNotice] = useState("");

  const onChoose = (planId: "free" | "pro") => {
    if (!user) {
      router.push(`/signup?next=/pricing`);
      return;
    }
    if (planId === "pro" && user.plan !== "pro") {
      setNotice("Redirecting to secure checkout…");
      void subscribePro();
    }
    if (planId === "free" && user.plan === "pro") {
      setNotice("Opening your billing portal…");
      void cancelPro();
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-14">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Simple, honest pricing
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Make receipts free forever. Upgrade to Pro to drop the watermark and save unlimited
          receipts.
        </p>
      </div>

      {notice ? (
        <div className="mx-auto mt-6 max-w-md rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrent = user?.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-white p-8 shadow-sm ${
                plan.highlighted ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                {plan.highlighted ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    <SparklesIcon className="h-3.5 w-3.5" />
                    Most popular
                  </span>
                ) : null}
              </div>
              <div className="mt-3 text-4xl font-extrabold text-slate-900">{plan.priceLabel}</div>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>

              <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                disabled={isCurrent}
                onClick={() => onChoose(plan.id)}
                variant={plan.highlighted ? "primary" : "secondary"}
                className="mt-8 w-full"
              >
                {plan.id === "pro" && !isCurrent ? <SparklesIcon className="h-4 w-4" /> : null}
                {isCurrent
                  ? "Current plan"
                  : plan.id === "pro"
                    ? user
                      ? "Upgrade to Pro"
                      : "Sign up for Pro"
                    : user?.plan === "pro"
                      ? "Switch to Free"
                      : "Get started"}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-slate-400">
        Secure payments are processed by Stripe. Cancel anytime from your billing portal.
      </p>
    </main>
  );
}
