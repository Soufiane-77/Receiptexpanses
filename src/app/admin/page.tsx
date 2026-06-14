"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { computeTotals, formatMoney } from "@/lib/calc";
import { loadSaved, removeSaved, saveDraft, type SavedReceipt } from "@/lib/storage";
import {
  isAuthed,
  loadSettings,
  logout,
  saveSettings,
  tryLogin,
  type AdminSettings,
} from "@/lib/adminSettings";
import { TEMPLATES, getTemplate } from "@/templates/registry";
import { Field, Section, Toggle, inputCls } from "@/components/fields";
import { Button } from "@/components/Button";
import TemplateIcon from "@/components/TemplateIcon";
import Logo from "@/components/Logo";
import { ChevronUpIcon, ChevronDownIcon, SlidersIcon } from "@/components/icons";
import AdminBlog from "@/components/admin/AdminBlog";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminAutomation from "@/components/admin/AdminAutomation";

type Tab =
  | "overview"
  | "saved"
  | "templates"
  | "blog"
  | "automation"
  | "payments"
  | "defaults"
  | "security";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setAuthed(isAuthed());
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">…</div>;
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (tryLogin(pw)) {
              setAuthed(true);
            } else {
              setErr("Wrong password");
            }
          }}
          className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-bold text-slate-900">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-500">
            Default password is <code className="rounded bg-slate-100 px-1">admin</code>. Change it in
            Security.
          </p>
          <input
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setErr("");
            }}
            placeholder="Password"
            className={`${inputCls} mt-4 w-full`}
            autoFocus
          />
          {err ? <p className="mt-2 text-sm text-red-500">{err}</p> : null}
          <button className="mt-4 w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Sign in
          </button>
          <Link href="/" className="mt-3 block text-center text-sm text-slate-500 hover:underline">
            ← Back to app
          </Link>
        </form>
      </main>
    );
  }

  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [saved, setSaved] = useState<SavedReceipt[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(loadSettings());

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  const update = (patch: Partial<AdminSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const stats = useMemo(() => {
    const totalValue = saved.reduce((sum, s) => sum + computeTotals(s.receipt).total, 0);
    const display = saved[0]?.receipt
      ? formatMoney(totalValue, saved[0].receipt.currency, saved[0].receipt.locale)
      : `$${totalValue.toFixed(2)}`;
    return { count: saved.length, totalValueDisplay: display };
  }, [saved]);

  const openReceipt = (s: SavedReceipt) => {
    saveDraft(s.receipt);
    router.push("/create");
  };

  const deleteReceipt = (id: string) => {
    if (!window.confirm("Delete this saved receipt?")) return;
    setSaved(removeSaved(id));
  };

  const moveTemplate = (id: string, dir: -1 | 1) => {
    const ids = [...settings.enabledTemplates];
    const i = ids.indexOf(id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    update({ enabledTemplates: ids });
  };

  const toggleTemplate = (id: string, on: boolean) => {
    const set = new Set(settings.enabledTemplates);
    if (on) set.add(id);
    else set.delete(id);
    // Preserve registry order for newly-added ones.
    update({ enabledTemplates: TEMPLATES.filter((t) => set.has(t.id)).map((t) => t.id) });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "saved", label: `Saved (${saved.length})` },
    { id: "templates", label: "Templates" },
    { id: "blog", label: "Blog" },
    { id: "automation", label: "Automation" },
    { id: "payments", label: "Payments" },
    { id: "defaults", label: "Defaults" },
    { id: "security", label: "Security" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="group rounded-lg" aria-label="ReceiptExpenses home">
              <Logo size="sm" />
            </Link>
            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              <SlidersIcon className="h-3.5 w-3.5" />
              Admin
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              onLogout();
            }}
            className="cursor-pointer rounded-md px-2 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <nav className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                tab === t.id
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "overview" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Saved receipts" value={String(stats.count)} />
            <StatCard label="Total value" value={stats.totalValueDisplay} />
            <StatCard label="Active templates" value={String(settings.enabledTemplates.length)} />
          </div>
        ) : null}

        {tab === "saved" ? (
          <div className="flex flex-col gap-3">
            {saved.length === 0 ? (
              <p className="text-slate-500">
                No saved receipts yet. Create one and hit “Save” on the editor.
              </p>
            ) : (
              saved.map((s) => {
                const t = computeTotals(s.receipt);
                return (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-500">
                        {getTemplate(s.receipt.templateId).name} ·{" "}
                        {new Date(s.savedAt).toLocaleString()} ·{" "}
                        {formatMoney(t.total, s.receipt.currency, s.receipt.locale)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => openReceipt(s)}>
                        Open
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteReceipt(s.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : null}

        {tab === "templates" ? (
          <Section title="Templates shown on the landing page">
            {TEMPLATES.map((t) => {
              const on = settings.enabledTemplates.includes(t.id);
              const order = settings.enabledTemplates.indexOf(t.id);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <TemplateIcon id={t.id} className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {on ? (
                      <div className="flex flex-col">
                        <button
                          aria-label="Move up"
                          disabled={order <= 0}
                          onClick={() => moveTemplate(t.id, -1)}
                          className="cursor-pointer rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          aria-label="Move down"
                          disabled={order === settings.enabledTemplates.length - 1}
                          onClick={() => moveTemplate(t.id, 1)}
                          className="cursor-pointer rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                    <Toggle label="" checked={on} onChange={(v) => toggleTemplate(t.id, v)} />
                  </div>
                </div>
              );
            })}
          </Section>
        ) : null}

        {tab === "defaults" ? (
          <Section title="Defaults applied to new receipts">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Default currency">
                <input
                  className={inputCls}
                  value={settings.defaults.currency}
                  onChange={(e) =>
                    update({ defaults: { ...settings.defaults, currency: e.target.value } })
                  }
                />
              </Field>
              <Field label="Default tax rate (%)">
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  value={settings.defaults.taxRatePct}
                  onChange={(e) =>
                    update({
                      defaults: { ...settings.defaults, taxRatePct: Number(e.target.value) },
                    })
                  }
                />
              </Field>
              <Field label="Accent color">
                <input
                  type="color"
                  className="h-10 w-full rounded-md border border-slate-300"
                  value={settings.defaults.accentColor}
                  onChange={(e) =>
                    update({ defaults: { ...settings.defaults, accentColor: e.target.value } })
                  }
                />
              </Field>
              <Field label="Footer note">
                <input
                  className={inputCls}
                  value={settings.defaults.footerNote}
                  onChange={(e) =>
                    update({ defaults: { ...settings.defaults, footerNote: e.target.value } })
                  }
                />
              </Field>
            </div>
            <Field label="Default business name">
              <input
                className={inputCls}
                value={settings.defaults.business.name}
                onChange={(e) =>
                  update({
                    defaults: {
                      ...settings.defaults,
                      business: { ...settings.defaults.business, name: e.target.value },
                    },
                  })
                }
              />
            </Field>
            <p className="text-xs text-slate-400">Changes save automatically.</p>
          </Section>
        ) : null}

        {tab === "blog" ? <AdminBlog /> : null}

        {tab === "automation" ? <AdminAutomation /> : null}

        {tab === "payments" ? <AdminPayments /> : null}

        {tab === "security" ? (
          <Section title="Security">
            <Field label="Admin password" hint="Stored in your browser only.">
              <input
                className={inputCls}
                value={settings.password}
                onChange={(e) => update({ password: e.target.value })}
              />
            </Field>
            <p className="text-xs text-slate-400">
              This is a client-side soft gate for a no-backend app — it keeps the panel tidy, not
              secure. Add real auth before any multi-user deployment.
            </p>
          </Section>
        ) : null}
      </div>
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
