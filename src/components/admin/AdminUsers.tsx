"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSettings } from "@/lib/adminSettings";
import { getTemplate } from "@/templates/registry";
import { Button } from "@/components/Button";
import { inputCls } from "@/components/fields";

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
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
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
      setUsersErr("Set the admin token in Admin → Security first.");
      setReceiptsErr("Set the admin token in Admin → Security first.");
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
      else setUsersErr(body.error || (u.value.status === 401 ? "Unauthorized — token doesn't match BLOG_ADMIN_TOKEN." : `Failed (${u.value.status}).`));
    } else setUsersErr("Network error loading users.");

    if (r.status === "fulfilled") {
      const body = (await r.value.json().catch(() => ({}))) as ReceiptPayload;
      if (r.value.ok) setReceipts(body);
      else setReceiptsErr(body.error || (r.value.status === 401 ? "Unauthorized — token doesn't match BLOG_ADMIN_TOKEN." : `Failed (${r.value.status}).`));
    } else setReceiptsErr("Network error loading receipt activity.");

    setLoading(false);
  }, []);

  useEffect(() => {
    const tok = loadSettings().automationToken ?? "";
    setToken(tok);
    void load(tok, days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxDay = Math.max(1, ...(receipts?.byDay ?? []).map((d) => d.count));

  return (
    <div className="flex flex-col gap-8">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Admin token</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="BLOG_ADMIN_TOKEN"
            className={`${inputCls} w-64`}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Period</span>
          <select
            value={days}
            onChange={(e) => {
              const d = Number(e.target.value);
              setDays(d);
              void load(token, d);
            }}
            className={`${inputCls} w-32`}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
        </label>
        <Button type="button" onClick={() => load(token, days)} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      {/* ---------------- Customers ---------------- */}
      <section>
        <h2 className="text-lg font-bold text-slate-900">Customers</h2>
        <p className="mt-1 text-sm text-slate-500">
          Registered accounts from Supabase Auth — the system of record for sign-ins.
        </p>

        {usersErr ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {usersErr}
          </div>
        ) : null}

        {users ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Total users" value={String(users.count) + (users.hasMore ? "+" : "")} />
              <Stat label="New (7 days)" value={String(users.stats.last7)} />
              <Stat label="Confirmed" value={String(users.stats.confirmed)} />
              <Stat
                label="Google sign-ups"
                value={String(users.stats.byProvider.find((p) => p.provider === "google")?.count ?? 0)}
              />
            </div>

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Sign-in</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                    <th className="px-4 py-3 font-semibold">Last seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        No users yet.
                      </td>
                    </tr>
                  ) : (
                    users.users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {u.email ?? "—"}
                          {!u.confirmed ? (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                              unconfirmed
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{u.name || "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              u.provider === "google"
                                ? "bg-red-50 text-red-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {u.provider}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{fmtDate(u.createdAt)}</td>
                        <td className="px-4 py-3 text-slate-500">{fmtDate(u.lastSignInAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>

      {/* ---------------- Receipt activity ---------------- */}
      <section>
        <h2 className="text-lg font-bold text-slate-900">Generated receipts</h2>
        <p className="mt-1 text-sm text-slate-500">
          Which templates users generate, and when. Receipt <strong>contents</strong> are never
          stored — they stay in the user&apos;s browser, as promised on the privacy page — so this
          shows activity, not the receipts themselves.
        </p>

        {receiptsErr ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {receiptsErr}
          </div>
        ) : null}

        {receipts ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label={`Generated (${receipts.days}d)`} value={String(receipts.total)} />
              <Stat label="All time" value={String(receipts.totalAllTime)} />
              <Stat label="By signed-in users" value={String(receipts.signedIn)} />
              <Stat label="By guests" value={String(receipts.anonymous)} />
            </div>

            {/* Daily bars */}
            {receipts.byDay.length > 0 ? (
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-700">Per day</h3>
                <div className="mt-4 flex h-32 items-end gap-1">
                  {receipts.byDay.map((d) => (
                    <div
                      key={d.day}
                      className="flex-1 rounded-t bg-brand-500/80 transition-colors hover:bg-brand-600"
                      style={{ height: `${Math.max(4, (d.count / maxDay) * 100)}%` }}
                      title={`${d.day}: ${d.count}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {/* Templates */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-700">Most used templates</h3>
                {receipts.byTemplate.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-400">No activity yet.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2">
                    {receipts.byTemplate.slice(0, 10).map((t) => {
                      const pct = Math.round((t.count / receipts.byTemplate[0]!.count) * 100);
                      let name = t.templateId;
                      try {
                        name = getTemplate(t.templateId).name;
                      } catch {
                        /* unknown id */
                      }
                      return (
                        <li key={t.templateId} className="text-sm">
                          <div className="flex justify-between text-slate-600">
                            <span>{name}</span>
                            <span className="font-medium text-slate-900">{t.count}</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                            <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Actions + top users */}
              <div className="flex flex-col gap-5">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-slate-700">By action</h3>
                  {receipts.byAction.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-400">No activity yet.</p>
                  ) : (
                    <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                      {receipts.byAction.map((a) => (
                        <li key={a.action} className="flex justify-between">
                          <span className="text-slate-600">{ACTION_LABEL[a.action] ?? a.action}</span>
                          <span className="font-medium text-slate-900">{a.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-slate-700">Most active users</h3>
                  {receipts.topUsers.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-400">No signed-in activity yet.</p>
                  ) : (
                    <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                      {receipts.topUsers.slice(0, 8).map((u) => (
                        <li key={u.userId} className="flex justify-between gap-3">
                          <span className="truncate text-slate-600">{u.email ?? u.userId.slice(0, 8)}</span>
                          <span className="font-medium text-slate-900">{u.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">When</th>
                    <th className="px-4 py-3 font-semibold">Template</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipts.recent.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        No receipts generated yet.
                      </td>
                    </tr>
                  ) : (
                    receipts.recent.map((r, i) => {
                      let name = r.templateId;
                      try {
                        name = getTemplate(r.templateId).name;
                      } catch {
                        /* unknown id */
                      }
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-500">{fmtDate(r.createdAt)}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{name}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {ACTION_LABEL[r.action] ?? r.action}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{r.email ?? "guest"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
