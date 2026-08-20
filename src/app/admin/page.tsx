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
import { Toggle } from "@/components/fields";
import TemplateIcon from "@/components/TemplateIcon";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  HomeIcon,
  UserIcon,
  SaveIcon,
  ReceiptIcon,
  SparklesIcon,
  FileSearchIcon,
  CartIcon,
  SlidersIcon,
  ShieldIcon,
  BarcodeIcon,
  MonitorIcon,
} from "@/components/icons";
import AdminBlogAnalytics from "@/components/admin/AdminBlogAnalytics";
import AdminCustomCode from "@/components/admin/AdminCustomCode";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminUsers from "@/components/admin/AdminUsers";
import AutopilotBlog from "@/components/admin/AutopilotBlog";
import AdminTemplateCustomizer from "@/components/admin/AdminTemplateCustomizer";
import AdminShell, { type NavItem } from "@/components/admin/AdminShell";
import {
  AdminButton,
  AdminField,
  Badge,
  Banner,
  Card,
  EmptyState,
  PageHeader,
  StatTile,
  Table,
  Td,
  Tr,
  adminInputCls,
} from "@/components/admin/ui";

type Tab =
  | "overview"
  | "users"
  | "saved"
  | "templates"
  | "customize"
  | "blog"
  | "blogstats"
  | "payments"
  | "defaults"
  | "code"
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f1f1] text-[#616161]">
        …
      </div>
    );
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f1f1f1] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (tryLogin(pw)) setAuthed(true);
            else setErr("Incorrect password. Try again.");
          }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-6 flex flex-col items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-base font-bold text-white">
              R
            </span>
            <h1 className="text-lg font-semibold text-[#303030]">Log in to ReceiptExpenses admin</h1>
          </div>

          <div className="rounded-xl border border-[#e3e3e3] bg-white p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
            <AdminField
              label="Password"
              htmlFor="admin-pw"
              hint={err ? undefined : "Default is “admin”. Change it under Security."}
            >
              <input
                id="admin-pw"
                type="password"
                autoComplete="current-password"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setErr("");
                }}
                className={adminInputCls}
                autoFocus
                aria-invalid={Boolean(err)}
                aria-describedby={err ? "admin-pw-error" : undefined}
              />
            </AdminField>
            {err ? (
              <p id="admin-pw-error" role="alert" className="mt-2 text-sm text-[#8e1f1f]">
                {err}
              </p>
            ) : null}
            <AdminButton type="submit" tone="primary" className="mt-5 w-full">
              Log in
            </AdminButton>
          </div>

          <Link
            href="/"
            className="mt-5 block text-center text-sm text-[#616161] underline-offset-2 hover:text-[#303030] hover:underline"
          >
            ← Back to ReceiptExpenses
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
    if (!window.confirm("Delete this saved receipt? This can't be undone.")) return;
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
    update({ enabledTemplates: TEMPLATES.filter((t) => set.has(t.id)).map((t) => t.id) });
  };

  const nav: NavItem<Tab>[] = [
    { id: "overview", label: "Overview", Icon: HomeIcon },
    { id: "users", label: "Users & activity", Icon: UserIcon },
    { id: "saved", label: "Saved receipts", Icon: SaveIcon, badge: String(saved.length) },
    { id: "templates", label: "Templates", Icon: ReceiptIcon },
    { id: "customize", label: "Customize", Icon: SparklesIcon },
    { id: "blog", label: "Blog", Icon: FileSearchIcon },
    { id: "blogstats", label: "Blog analytics", Icon: MonitorIcon },
    { id: "payments", label: "Payments", Icon: CartIcon },
    { id: "defaults", label: "Defaults", Icon: SlidersIcon },
    { id: "code", label: "Custom code", Icon: BarcodeIcon },
    { id: "security", label: "Security", Icon: ShieldIcon },
  ];

  return (
    <AdminShell
      nav={nav}
      current={tab}
      onNavigate={setTab}
      onSignOut={() => {
        logout();
        onLogout();
      }}
    >
      {/* ------------------------------ Overview ----------------------------- */}
      {tab === "overview" ? (
        <>
          <PageHeader
            title="Overview"
            subtitle="A snapshot of this browser's admin workspace. Customer accounts and live receipt activity live under Users & activity."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Saved receipts" value={String(stats.count)} hint="In this browser" />
            <StatTile label="Total value" value={stats.totalValueDisplay} hint="Across saved receipts" />
            <StatTile
              label="Active templates"
              value={String(settings.enabledTemplates.length)}
              hint={`of ${TEMPLATES.length} available`}
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Card
              title="Customers & receipt activity"
              description="See who signed up and which templates they generate."
              actions={
                <AdminButton size="sm" onClick={() => setTab("users")}>
                  Open
                </AdminButton>
              }
            >
              <p className="text-sm leading-relaxed text-[#616161]">
                Accounts come from Supabase Auth; receipt activity is recorded as metadata only —
                template, action and timestamp, never receipt contents.
              </p>
            </Card>
            <Card
              title="Landing page templates"
              description="Choose which templates appear, and in what order."
              actions={
                <AdminButton size="sm" onClick={() => setTab("templates")}>
                  Manage
                </AdminButton>
              }
            >
              <p className="text-sm leading-relaxed text-[#616161]">
                {settings.enabledTemplates.length} of {TEMPLATES.length} templates are currently
                shown on the public site.
              </p>
            </Card>
          </div>
        </>
      ) : null}

      {/* ------------------------------- Users ------------------------------- */}
      {tab === "users" ? <AdminUsers /> : null}

      {/* ------------------------------- Saved ------------------------------- */}
      {tab === "saved" ? (
        <>
          <PageHeader
            title="Saved receipts"
            subtitle="Receipts you saved in this browser."
            actions={
              <AdminButton tone="primary" onClick={() => router.push("/create")}>
                Create receipt
              </AdminButton>
            }
          />
          <div className="mb-4">
            <Banner tone="info" title="These are your own receipts, not your customers'">
              Receipt content never reaches the server by design, so customer receipts can&apos;t be
              listed anywhere. See <strong>Users &amp; activity</strong> for what customers generate.
            </Banner>
          </div>

          <Card padding={false}>
            {saved.length === 0 ? (
              <EmptyState
                title="No saved receipts yet"
                description="Create a receipt and choose Save in the editor to keep it here."
                action={
                  <AdminButton tone="primary" onClick={() => router.push("/create")}>
                    Create receipt
                  </AdminButton>
                }
              />
            ) : (
              <Table head={["Name", "Template", "Saved", "Total", ""]}>
                {saved.map((s) => {
                  const t = computeTotals(s.receipt);
                  return (
                    <Tr key={s.id}>
                      <Td strong>{s.name}</Td>
                      <Td>{getTemplate(s.receipt.templateId).name}</Td>
                      <Td>{new Date(s.savedAt).toLocaleDateString()}</Td>
                      <Td numeric>{formatMoney(t.total, s.receipt.currency, s.receipt.locale)}</Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-2">
                          <AdminButton size="sm" onClick={() => openReceipt(s)}>
                            Open
                          </AdminButton>
                          <AdminButton
                            size="sm"
                            tone="critical"
                            onClick={() => deleteReceipt(s.id)}
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Table>
            )}
          </Card>
        </>
      ) : null}

      {/* ----------------------------- Templates ----------------------------- */}
      {tab === "templates" ? (
        <>
          <PageHeader
            title="Templates"
            subtitle="Toggle which receipt templates appear on the landing page, and drag their order with the arrows."
          />
          <Card padding={false}>
            <ul className="divide-y divide-[#f0f0f0]">
              {TEMPLATES.map((t) => {
                const on = settings.enabledTemplates.includes(t.id);
                const order = settings.enabledTemplates.indexOf(t.id);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f1f1] text-[#4a4a4a]">
                        <TemplateIcon id={t.id} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-[#303030]">
                            {t.name}
                          </span>
                          {on ? <Badge tone="success">Live</Badge> : null}
                        </div>
                        <p className="truncate text-xs text-[#616161]">{t.description}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {on ? (
                        <div className="flex flex-col">
                          <button
                            type="button"
                            aria-label={`Move ${t.name} up`}
                            disabled={order <= 0}
                            onClick={() => moveTemplate(t.id, -1)}
                            className="cursor-pointer rounded p-1 text-[#8a8a8a] transition-colors hover:text-[#303030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ChevronUpIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${t.name} down`}
                            disabled={order === settings.enabledTemplates.length - 1}
                            onClick={() => moveTemplate(t.id, 1)}
                            className="cursor-pointer rounded p-1 text-[#8a8a8a] transition-colors hover:text-[#303030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ChevronDownIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null}
                      <Toggle label="" checked={on} onChange={(v) => toggleTemplate(t.id, v)} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      ) : null}

      {/* ----------------------------- Customize ----------------------------- */}
      {tab === "customize" ? (
        <>
          <PageHeader
            title="Customize"
            subtitle="Override template branding — names, descriptions and logos shown on the public site."
          />
          <AdminTemplateCustomizer />
        </>
      ) : null}

      {/* ------------------------------ Defaults ----------------------------- */}
      {tab === "defaults" ? (
        <>
          <PageHeader
            title="Defaults"
            subtitle="Applied to every new receipt. Changes save automatically."
          />
          <Card title="Receipt defaults">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Default currency" htmlFor="d-currency">
                <input
                  id="d-currency"
                  className={adminInputCls}
                  value={settings.defaults.currency}
                  onChange={(e) =>
                    update({ defaults: { ...settings.defaults, currency: e.target.value } })
                  }
                />
              </AdminField>
              <AdminField label="Default tax rate (%)" htmlFor="d-tax">
                <input
                  id="d-tax"
                  type="number"
                  step="0.01"
                  className={adminInputCls}
                  value={settings.defaults.taxRatePct}
                  onChange={(e) =>
                    update({
                      defaults: { ...settings.defaults, taxRatePct: Number(e.target.value) },
                    })
                  }
                />
              </AdminField>
              <AdminField label="Accent color" htmlFor="d-accent">
                <input
                  id="d-accent"
                  type="color"
                  className="h-10 w-full cursor-pointer rounded-lg border border-[#c9c9c9] bg-white p-1"
                  value={settings.defaults.accentColor}
                  onChange={(e) =>
                    update({ defaults: { ...settings.defaults, accentColor: e.target.value } })
                  }
                />
              </AdminField>
              <AdminField label="Footer note" htmlFor="d-footer">
                <input
                  id="d-footer"
                  className={adminInputCls}
                  value={settings.defaults.footerNote}
                  onChange={(e) =>
                    update({ defaults: { ...settings.defaults, footerNote: e.target.value } })
                  }
                />
              </AdminField>
            </div>
            <div className="mt-4">
              <AdminField label="Default business name" htmlFor="d-business">
                <input
                  id="d-business"
                  className={adminInputCls}
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
              </AdminField>
            </div>
          </Card>
        </>
      ) : null}

      {/* -------------------------------- Blog ------------------------------- */}
      {tab === "blog" ? (
        <>
          <PageHeader
            title="Blog"
            subtitle="Autopilot content pipeline — keywords, generation queue and publishing."
          />
          <AutopilotBlog />
        </>
      ) : null}

      {/* ------------------------------ Payments ----------------------------- */}
      {tab === "payments" ? (
        <>
          <PageHeader title="Payments" subtitle="Stripe configuration and subscription state." />
          <AdminPayments />
        </>
      ) : null}

      {/* -------------------------- Blog analytics --------------------------- */}
      {tab === "blogstats" ? <AdminBlogAnalytics /> : null}

      {/* ---------------------------- Custom code ---------------------------- */}
      {tab === "code" ? <AdminCustomCode /> : null}

      {/* ------------------------------ Security ----------------------------- */}
      {tab === "security" ? (
        <>
          <PageHeader title="Security" subtitle="Access to this panel and the automation API." />
          <div className="flex flex-col gap-4">
            <Banner tone="warning" title="This panel is a soft gate, not real security">
              The password below is stored in your browser only. Server routes are protected
              separately by the <code className="font-mono text-xs">BLOG_ADMIN_TOKEN</code> Worker
              secret. Add real auth before any multi-user deployment.
            </Banner>

            <Card title="Admin password">
              <AdminField label="Password" htmlFor="s-pw" hint="Stored in this browser only.">
                <input
                  id="s-pw"
                  className={adminInputCls}
                  value={settings.password}
                  onChange={(e) => update({ password: e.target.value })}
                />
              </AdminField>
            </Card>

            <Card title="Automation token">
              <AdminField
                label="Admin API token"
                htmlFor="s-token"
                hint="Must match the Worker secret BLOG_ADMIN_TOKEN. Used by Users & activity and Blog to authorize server requests."
              >
                <input
                  id="s-token"
                  type="password"
                  className={adminInputCls}
                  value={settings.automationToken}
                  onChange={(e) => update({ automationToken: e.target.value })}
                  placeholder="paste the value set via wrangler secret put"
                />
              </AdminField>
            </Card>
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
