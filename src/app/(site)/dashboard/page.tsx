"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useAuthLoaded } from "@/lib/auth";
import { PAYMENTS_ENABLED } from "@/lib/features";
import { cancelPro, subscribePro } from "@/lib/subscription";
import { computeTotals, formatMoney } from "@/lib/calc";
import { loadSaved, removeSaved, saveDraft, type SavedReceipt } from "@/lib/storage";
import { getTemplate } from "@/templates/registry";
import { Button, ButtonLink } from "@/components/Button";
import TemplateIcon from "@/components/TemplateIcon";
import { PlusIcon, SparklesIcon, TrashIcon } from "@/components/icons";

export default function DashboardPage() {
  const user = useCurrentUser();
  const authLoaded = useAuthLoaded();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<SavedReceipt[]>([]);

  useEffect(() => {
    setReady(true);
    setSaved(loadSaved());
  }, []);

  // Redirect to login only once the session check has resolved (avoids
  // bouncing a logged-in user during the initial /api/auth/me fetch).
  useEffect(() => {
    if (authLoaded && !user) router.replace("/login?next=/dashboard");
  }, [authLoaded, user, router]);

  const stats = useMemo(() => {
    const total = saved.reduce((sum, s) => sum + computeTotals(s.receipt).total, 0);
    const display = saved[0]
      ? formatMoney(total, saved[0].receipt.currency, saved[0].receipt.locale)
      : "$0.00";
    return { count: saved.length, totalDisplay: display };
  }, [saved]);

  if (!ready || !authLoaded || !user) {
    return <div className="flex min-h-[60vh] items-center justify-center text-slate-400">…</div>;
  }

  const isPro = user.plan === "pro";

  const open = (s: SavedReceipt) => {
    saveDraft(s.receipt);
    router.push("/create");
  };
  const del = (id: string) => {
    if (!window.confirm("Delete this saved receipt?")) return;
    setSaved(removeSaved(id));
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <ButtonLink href="/create">
          <PlusIcon className="h-4 w-4" />
          New receipt
        </ButtonLink>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Saved receipts" value={String(stats.count)} />
        <StatCard label="Total value" value={stats.totalDisplay} />
        <StatCard label="Plan" value={PAYMENTS_ENABLED ? (isPro ? "Pro" : "Preview") : "Free"} />
      </div>

      {/* Subscription panel — only while paid plans are enabled. */}
      {PAYMENTS_ENABLED ? (
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Subscription</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isPro ? (
                <>
                  You're on <span className="font-medium text-brand-600">Pro</span>
                  {user.proSince
                    ? ` since ${new Date(user.proSince).toLocaleDateString()}`
                    : ""}{" "}
                  — no watermark, unlimited saves.
                </>
              ) : (
                <>
                  You're previewing for free. Subscribe to Pro to download, print and save your
                  receipts — watermark-free.
                </>
              )}
            </p>
          </div>
          {isPro ? (
            <Button variant="secondary" onClick={() => cancelPro()}>
              Cancel Pro
            </Button>
          ) : (
            <Button onClick={() => subscribePro()}>
              <SparklesIcon className="h-4 w-4" />
              Subscribe to Pro
            </Button>
          )}
        </div>
      </section>
      ) : null}

      {/* Blog subscription */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Newsletter</h2>
            <p className="mt-1 text-sm text-slate-500">
              {user.blogSubscribed
                ? "You're subscribed to the blog newsletter."
                : "You're not subscribed to the blog newsletter yet."}
            </p>
          </div>
          <Link href="/blogs" className="text-sm font-medium text-brand-600 hover:underline">
            {user.blogSubscribed ? "Read the blog →" : "Subscribe on the blog →"}
          </Link>
        </div>
      </section>

      {/* Saved receipts */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Your saved receipts</h2>
        {saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No saved receipts yet.{" "}
            <Link href="/create" className="font-medium text-brand-600 hover:underline">
              Create your first one →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {saved.map((s) => {
              const t = computeTotals(s.receipt);
              return (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <TemplateIcon id={s.receipt.templateId} className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-500">
                        {getTemplate(s.receipt.templateId).name} ·{" "}
                        {new Date(s.savedAt).toLocaleDateString()} ·{" "}
                        {formatMoney(t.total, s.receipt.currency, s.receipt.locale)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => open(s)}>
                      Open
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => del(s.id)}>
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
