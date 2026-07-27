"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSettings } from "@/lib/adminSettings";
import { getTemplate } from "@/templates/registry";
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
} from "./ui";

type AdminUser = {
  id: string;
  email: string | null;
  name: string;
  provider: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  confirmed: boolean;
};

type UsersPayload = {
  users: AdminUser[];
  count: number;
  hasMore: boolean;
  stats: {
    confirmed: number;
    unconfirmed: number;
    last7: number;
    byProvider: { provider: string; count: number }[];
  };
  error?: string;
};

type ReceiptPayload = {
  days: number;
  total: number;
  totalAllTime: number;
  signedIn: number;
  anonymous: number;
  byAction: { action: string; count: number }[];
  byTemplate: { templateId: string; count: number }[];
  byDay: { day: string; count: number }[];
  topUsers: { userId: string; email: string | null; count: number; lastAt: string }[];
  recent: { createdAt: string; templateId: string; action: string; email: string | null }[];
  error?: string;
};

const ACTION_LABEL: Record<string, string> = {
  pdf: "PDF download",
  png: "PNG download",
  print: "Print",
  save: "Saved",
};

function fmtDate(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v.includes("T") ? v : `${v.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function fmtDateTime(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v.includes("T") ? v : `${v.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function templateName(id: string): string {
  try {
    return getTemplate(id).name;
  } catch {
    return id;
  }
}

export default function AdminUsers() {
  const [token, setToken] = useState("");
  const [users, setUsers] = useState<UsersPayload | null>(null);
  const [receipts, setReceipts] = useState<ReceiptPayload | null>(null);
  const [usersErr, setUsersErr] = useState("");
  const [receiptsErr, setReceiptsErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);

  const load = useCallback(async (tok: string, d: number) => {
    if (!tok) {
      const msg = "Add your admin API token under Security to load this data.";
      setUsersErr(msg);
      setReceiptsErr(msg);
      return;
    }
    setLoading(true);
    setUsersErr("");
    setReceiptsErr("");
    const headers = { "x-admin-token": tok };

    const [u, r] = await Promise.allSettled([
      fetch(`/api/admin/users?perPage=200`, { headers }),
      fetch(`/api/admin/receipts?days=${d}`, { headers }),
    ]);

    if (u.status === "fulfilled") {
      const body = (await u.value.json().catch(() => ({}))) as UsersPayload;
      if (u.value.ok) setUsers(body);
      else
        setUsersErr(
          body.error ||
            (u.value.status === 401
              ? "Unauthorized — the token doesn't match BLOG_ADMIN_TOKEN."
              : `Couldn't load users (${u.value.status}).`)
        );
    } else setUsersErr("Network error while loading users.");

    if (r.status === "fulfilled") {
      const body = (await r.value.json().catch(() => ({}))) as ReceiptPayload;
      if (r.value.ok) setReceipts(body);
      else
        setReceiptsErr(
          body.error ||
            (r.value.status === 401
              ? "Unauthorized — the token doesn't match BLOG_ADMIN_TOKEN."
              : `Couldn't load receipt activity (${r.value.status}).`)
        );
    } else setReceiptsErr("Network error while loading receipt activity.");

    setLoading(false);
  }, []);

  useEffect(() => {
    const tok = loadSettings().automationToken ?? "";
    setToken(tok);
    void load(tok, days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxDay = Math.max(1, ...(receipts?.byDay ?? []).map((d) => d.count));
  const topTemplate = receipts?.byTemplate[0]?.count ?? 1;

  return (
    <>
      <PageHeader
        title="Users & activity"
        subtitle="Customer accounts from Supabase Auth, plus what people generate. Receipt contents are never stored — only which template, which action and when."
        actions={
          <AdminButton onClick={() => load(token, days)} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </AdminButton>
        }
      />

      {/* Controls */}
      <Card className="mb-5" title="Data source">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Admin API token"
            htmlFor="au-token"
            hint="Must match the Worker secret BLOG_ADMIN_TOKEN."
          >
            <input
              id="au-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="BLOG_ADMIN_TOKEN"
              className={adminInputCls}
            />
          </AdminField>
          <AdminField label="Activity period" htmlFor="au-days">
            <select
              id="au-days"
              value={days}
              onChange={(e) => {
                const d = Number(e.target.value);
                setDays(d);
                void load(token, d);
              }}
              className={adminInputCls}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 12 months</option>
            </select>
          </AdminField>
        </div>
      </Card>

      {/* ------------------------------ Customers ----------------------------- */}
      <h2 className="mb-3 text-base font-semibold text-[#303030]">Customers</h2>

      {usersErr ? (
        <div className="mb-4">
          <Banner tone="warning" title="Customer list unavailable">
            {usersErr}
          </Banner>
        </div>
      ) : null}

      {users ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              label="Total customers"
              value={`${users.count}${users.hasMore ? "+" : ""}`}
            />
            <StatTile label="New this week" value={String(users.stats.last7)} hint="Last 7 days" />
            <StatTile label="Confirmed" value={String(users.stats.confirmed)} />
            <StatTile
              label="Google sign-ups"
              value={String(users.stats.byProvider.find((p) => p.provider === "google")?.count ?? 0)}
            />
          </div>

          <Card className="mt-4" padding={false}>
            {users.users.length === 0 ? (
              <EmptyState
                title="No customers yet"
                description="Accounts will appear here as people sign up to download receipts."
              />
            ) : (
              <Table head={["Customer", "Sign-in", "Joined", "Last seen", "Status"]}>
                {users.users.map((u) => (
                  <Tr key={u.id}>
                    <Td strong>
                      <div className="min-w-0">
                        <div className="truncate">{u.email ?? "—"}</div>
                        {u.name ? (
                          <div className="truncate text-xs font-normal text-[#616161]">{u.name}</div>
                        ) : null}
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={u.provider === "google" ? "info" : "neutral"}>{u.provider}</Badge>
                    </Td>
                    <Td>{fmtDate(u.createdAt)}</Td>
                    <Td>{fmtDate(u.lastSignInAt)}</Td>
                    <Td>
                      {u.confirmed ? (
                        <Badge tone="success">Confirmed</Badge>
                      ) : (
                        <Badge tone="warning">Pending</Badge>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Table>
            )}
          </Card>
        </>
      ) : null}

      {/* --------------------------- Receipt activity -------------------------- */}
      <h2 className="mb-3 mt-8 text-base font-semibold text-[#303030]">Generated receipts</h2>

      {receiptsErr ? (
        <div className="mb-4">
          <Banner tone="warning" title="Receipt activity unavailable">
            {receiptsErr}
          </Banner>
        </div>
      ) : null}

      {receipts ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              label="Generated"
              value={String(receipts.total)}
              hint={`Last ${receipts.days} days`}
            />
            <StatTile label="All time" value={String(receipts.totalAllTime)} />
            <StatTile label="By customers" value={String(receipts.signedIn)} hint="Signed in" />
            <StatTile label="By guests" value={String(receipts.anonymous)} hint="Not signed in" />
          </div>

          {receipts.byDay.length > 0 ? (
            <Card className="mt-4" title={`Receipts per day · last ${receipts.days} days`}>
              <div className="flex h-32 items-end gap-1" role="img" aria-label={`Receipt volume over the last ${receipts.days} days`}>
                {receipts.byDay.map((d) => (
                  <div
                    key={d.day}
                    className="group relative flex-1 rounded-t bg-brand-500/80 transition-colors hover:bg-brand-600"
                    style={{ height: `${Math.max(4, (d.count / maxDay) * 100)}%` }}
                    title={`${d.day}: ${d.count}`}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-[#8a8a8a]">
                <span>{receipts.byDay[0]?.day}</span>
                <span>{receipts.byDay[receipts.byDay.length - 1]?.day}</span>
              </div>
            </Card>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card title="Most used templates">
              {receipts.byTemplate.length === 0 ? (
                <p className="text-sm text-[#616161]">No activity yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {receipts.byTemplate.slice(0, 8).map((t) => (
                    <li key={t.templateId}>
                      <div className="flex justify-between text-sm">
                        <span className="truncate text-[#303030]">{templateName(t.templateId)}</span>
                        <span className="ml-3 shrink-0 font-medium tabular-nums text-[#303030]">
                          {t.count}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f1f1f1]">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${Math.round((t.count / topTemplate) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="flex flex-col gap-4">
              <Card title="By action">
                {receipts.byAction.length === 0 ? (
                  <p className="text-sm text-[#616161]">No activity yet.</p>
                ) : (
                  <ul className="flex flex-col gap-2 text-sm">
                    {receipts.byAction.map((a) => (
                      <li key={a.action} className="flex justify-between">
                        <span className="text-[#616161]">{ACTION_LABEL[a.action] ?? a.action}</span>
                        <span className="font-medium tabular-nums text-[#303030]">{a.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card title="Most active customers">
                {receipts.topUsers.length === 0 ? (
                  <p className="text-sm text-[#616161]">No signed-in activity yet.</p>
                ) : (
                  <ul className="flex flex-col gap-2 text-sm">
                    {receipts.topUsers.slice(0, 6).map((u) => (
                      <li key={u.userId} className="flex justify-between gap-3">
                        <span className="truncate text-[#616161]">
                          {u.email ?? u.userId.slice(0, 8)}
                        </span>
                        <span className="shrink-0 font-medium tabular-nums text-[#303030]">
                          {u.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>

          <Card className="mt-4" title="Recent activity" padding={false}>
            {receipts.recent.length === 0 ? (
              <EmptyState
                title="No receipts generated yet"
                description="Activity appears here as soon as someone downloads, prints or saves a receipt."
              />
            ) : (
              <Table head={["When", "Template", "Action", "Customer"]}>
                {receipts.recent.map((r, i) => (
                  <Tr key={i}>
                    <Td>{fmtDateTime(r.createdAt)}</Td>
                    <Td strong>{templateName(r.templateId)}</Td>
                    <Td>{ACTION_LABEL[r.action] ?? r.action}</Td>
                    <Td>
                      {r.email ?? <span className="text-[#8a8a8a]">Guest</span>}
                    </Td>
                  </Tr>
                ))}
              </Table>
            )}
          </Card>
        </>
      ) : null}
    </>
  );
}
