"use client";

import { useState } from "react";
import { loadSettings, saveSettings, type AdminSettings } from "@/lib/adminSettings";
import { Field, Section, inputCls } from "@/components/fields";
import { Button } from "@/components/Button";

export default function AdminPayments() {
  const [settings, setSettings] = useState<AdminSettings>(() => loadSettings());
  const [saved, setSaved] = useState(false);

  const update = (patch: Partial<AdminSettings["payments"]>) => {
    const next = { ...settings, payments: { ...settings.payments, ...patch } };
    setSettings(next);
    saveSettings(next);
    setSaved(true);
  };

  const p = settings.payments;

  return (
    <div className="flex flex-col gap-4">
      {/* Security warning — this is the important part */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Only publishable keys go here.</p>
        <p className="mt-1">
          A payment provider has two keys. The <strong>publishable key</strong> (Stripe{" "}
          <code className="rounded bg-amber-100 px-1">pk_…</code>) is designed to be visible in the
          browser — safe to store. The <strong>secret key</strong>{" "}
          (<code className="rounded bg-amber-100 px-1">sk_…</code>) must <strong>never</strong> be
          put in a client-side app or a soft-gated admin panel — anyone could read it. There is no
          field for it here on purpose.
        </p>
      </div>

      <Section title="Payment provider">
        <Field label="Provider">
          <select
            className={inputCls}
            value={p.provider}
            onChange={(e) => update({ provider: e.target.value as "none" | "stripe" })}
          >
            <option value="none">None (payments disabled)</option>
            <option value="stripe">Stripe</option>
          </select>
        </Field>

        {p.provider === "stripe" ? (
          <>
            <Field label="Publishable key" hint="Starts with pk_test_ or pk_live_">
              <input
                className={inputCls}
                placeholder="pk_live_…"
                value={p.publishableKey}
                onChange={(e) => update({ publishableKey: e.target.value })}
              />
            </Field>
            <Field label="Pro plan price ID" hint="From your Stripe dashboard, e.g. price_123">
              <input
                className={inputCls}
                placeholder="price_…"
                value={p.proPriceId}
                onChange={(e) => update({ proPriceId: e.target.value })}
              />
            </Field>
          </>
        ) : null}

        {saved ? <p className="text-xs text-emerald-600">Saved automatically.</p> : null}
      </Section>

      <Section title="Where the secret key goes">
        <p className="text-sm text-slate-600">
          Keep the secret key in server environment variables and create the checkout session on the
          server. For example, in a <code className="rounded bg-slate-100 px-1">.env</code> the app
          reads at runtime (never committed):
        </p>
        <pre className="overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`# .env (server only — do NOT expose to the browser)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Safe to expose:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx`}
        </pre>
        <p className="text-xs text-slate-400">
          This app has no backend yet, so checkout is simulated. When you add one, read the secret
          key from the environment there — not from this panel.
        </p>
      </Section>
    </div>
  );
}
