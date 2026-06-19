"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { loadSettings as loadAdminSettings } from "@/lib/adminSettings";
import { Field, Section, Toggle, inputCls } from "@/components/fields";
import { Button } from "@/components/Button";

// Mirrors src/lib/server/blogSettings.ts BlogSettings.
type Settings = {
  autoPublish: boolean;
  running: boolean;
  intervalHours: number;
  dailyCap: number;
  minSpacingMinutes: number;
  author: string;
  cover: string;
  brandVoice: string;
  model: string;
  minWordCount: number;
  internalLinkDensity: number;
  ctaText: string;
  ctaUrl: string;
  ctaLabel: string;
  enableIndexNow: boolean;
  enableGoogleIndexing: boolean;
};

type Keyword = {
  id: number;
  keyword: string;
  status: string;
  created_at: number;
  processed_at: number | null;
  error: string | null;
  post_slug: string | null;
};

type PostSummary = {
  slug: string;
  title: string;
  status: string;
  source: string;
  date: string;
  keyword?: string;
  wordCount?: number;
  indexStatus?: Record<string, { ok: boolean; status?: number; detail?: string }>;
};

type Dashboard = {
  settings: Settings;
  keywords: Keyword[];
  posts: PostSummary[];
  indexNowKey: string;
  publicUrl: string;
  publishedToday: number;
};

const statusChip: Record<string, string> = {
  queued: "bg-slate-100 text-slate-600",
  processing: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  skipped_duplicate: "bg-slate-100 text-slate-400",
  draft: "bg-slate-100 text-slate-500",
};

export default function AutopilotBlog() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Dashboard | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async (tok: string) => {
    if (!tok) {
      setStatus("Set the automation token in Admin → Security first.");
      setLoaded(true);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/blog", {
        headers: { "x-admin-token": tok },
        credentials: "same-origin",
      });
      if (res.status === 401) {
        setStatus("Unauthorized — token doesn't match the Worker secret BLOG_ADMIN_TOKEN.");
        return;
      }
      if (!res.ok) {
        setStatus(`Server error (${res.status}). Has migration 0003 been applied?`);
        return;
      }
      const d = (await res.json()) as Dashboard;
      setData(d);
      setSettings(d.settings);
      setStatus("");
    } catch {
      setStatus("Network error talking to the server.");
    } finally {
      setBusy(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const tok = loadAdminSettings().automationToken;
    setToken(tok);
    void refresh(tok);
  }, [refresh]);

  const post = useCallback(
    async (payload: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
      setBusy(true);
      try {
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-token": token },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        });
        const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (!res.ok) {
          setStatus(res.status === 401 ? "Unauthorized — check the token." : `Failed (${res.status}).`);
          return null;
        }
        return json;
      } catch {
        setStatus("Network error.");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [token]
  );

  const addKeywords = async () => {
    const r = await post({ action: "add_keywords", keywords: keywordInput });
    if (r) {
      setStatus(`Added ${r.added ?? 0}, skipped ${r.skipped ?? 0} duplicate(s).`);
      setKeywordInput("");
      await refresh(token);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    const r = await post({ action: "save_settings", settings });
    if (r) {
      setStatus("Settings saved.");
      await refresh(token);
    }
  };

  const runNow = async () => {
    setStatus("Generating with Workers AI…");
    const r = await post({ action: "run_now" });
    if (r) {
      setStatus(String(r.reason ?? "Done."));
      await refresh(token);
    }
  };

  const keywordAction = async (action: string, id: number) => {
    if (await post({ action, id })) await refresh(token);
  };

  const postAction = async (action: string, slug: string) => {
    if (action === "post_delete" && !window.confirm("Delete this post permanently?")) return;
    const r = await post({ action, slug });
    if (r) {
      if (action === "post_reindex") setStatus("Resubmitted for indexing.");
      await refresh(token);
    }
  };

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((s) => (s ? { ...s, [key]: value } : s));

  const cronUrl = data ? `${data.publicUrl}/api/cron/run?token=${token || "<TOKEN>"}` : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-semibold">Autopilot Blog</p>
        <p className="mt-1">
          Paste keywords, choose draft or auto-publish, and the engine writes a full SEO/GEO article
          (headings, table, FAQ, internal links, CTA, JSON-LD) per keyword and submits it for indexing.
          One post per scheduler tick, capped per day. Generation uses <strong>Cloudflare Workers AI</strong> (free).
        </p>
      </div>

      {status ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{status}</div>
      ) : null}

      {/* Keyword intake */}
      <Section title="Add keywords">
        <Field label="One keyword per line (commas also work)" hint="Duplicates of queued keywords and existing post topics are skipped.">
          <textarea
            className={`${inputCls} min-h-[110px]`}
            placeholder={"restaurant receipt template\nhow to make a fuel receipt\nparking receipt for expenses"}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={addKeywords} disabled={busy || !keywordInput.trim()}>Add to queue</Button>
          <Button variant="secondary" onClick={runNow} disabled={busy}>Run one now</Button>
          {data ? <span className="text-xs text-slate-400">Published today: {data.publishedToday}</span> : null}
        </div>
      </Section>

      {/* Autopilot + content settings */}
      {settings ? (
        <Section title="Autopilot settings">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mode">
              <label className="flex h-10 items-center gap-2 text-sm text-slate-700">
                <Toggle label="" checked={settings.autoPublish} onChange={(v) => set("autoPublish", v)} />
                {settings.autoPublish ? "Auto-publish live" : "Save as draft for review (recommended)"}
              </label>
            </Field>
            <Field label="Scheduler">
              <label className="flex h-10 items-center gap-2 text-sm text-slate-700">
                <Toggle label="" checked={settings.running} onChange={(v) => set("running", v)} />
                {settings.running ? "On — runs on cadence" : "Off — paused"}
              </label>
            </Field>
            <Field label="Publish every (hours)">
              <input type="number" min={1} className={inputCls} value={settings.intervalHours}
                onChange={(e) => set("intervalHours", Math.max(1, Number(e.target.value) || 1))} />
            </Field>
            <Field label="Daily cap (posts/day)">
              <input type="number" min={1} className={inputCls} value={settings.dailyCap}
                onChange={(e) => set("dailyCap", Math.max(1, Number(e.target.value) || 1))} />
            </Field>
            <Field label="Min spacing (minutes)">
              <input type="number" min={0} className={inputCls} value={settings.minSpacingMinutes}
                onChange={(e) => set("minSpacingMinutes", Math.max(0, Number(e.target.value) || 0))} />
            </Field>
            <Field label="Min word count (quality floor)">
              <input type="number" min={200} className={inputCls} value={settings.minWordCount}
                onChange={(e) => set("minWordCount", Math.max(200, Number(e.target.value) || 200))} />
            </Field>
            <Field label="Author">
              <input className={inputCls} value={settings.author} onChange={(e) => set("author", e.target.value)} />
            </Field>
            <Field label="Cover emoji (fallback)">
              <input className={inputCls} value={settings.cover} onChange={(e) => set("cover", e.target.value)} />
            </Field>
            <Field label="Internal links per post">
              <input type="number" min={0} className={inputCls} value={settings.internalLinkDensity}
                onChange={(e) => set("internalLinkDensity", Math.max(0, Number(e.target.value) || 0))} />
            </Field>
            <Field label="Model (Workers AI)">
              <input className={inputCls} value={settings.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
          </div>

          <Field label="Brand voice / tone">
            <textarea className={`${inputCls} min-h-[70px]`} value={settings.brandVoice}
              onChange={(e) => set("brandVoice", e.target.value)} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="CTA text">
              <input className={inputCls} value={settings.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
            </Field>
            <Field label="CTA button label">
              <input className={inputCls} value={settings.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} />
            </Field>
            <Field label="CTA URL">
              <input className={inputCls} value={settings.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="IndexNow (Bing/Yandex/Naver/Seznam)">
              <label className="flex h-10 items-center gap-2 text-sm text-slate-700">
                <Toggle label="" checked={settings.enableIndexNow} onChange={(v) => set("enableIndexNow", v)} />
                {settings.enableIndexNow ? "On — submit on publish" : "Off"}
              </label>
            </Field>
            <Field label="Google Indexing API" hint="Google restricts this API to JobPosting/BroadcastEvent and may reject other use. Keep off; rely on sitemap + Search Console.">
              <label className="flex h-10 items-center gap-2 text-sm text-slate-700">
                <Toggle label="" checked={settings.enableGoogleIndexing} onChange={(v) => set("enableGoogleIndexing", v)} />
                {settings.enableGoogleIndexing ? "On (advanced)" : "Off (recommended)"}
              </label>
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={saveSettings} disabled={busy}>Save settings</Button>
          </div>
        </Section>
      ) : null}

      {/* Queue */}
      {loaded && data ? (
        <Section title={`Queue (${data.keywords.length})`}>
          {data.keywords.length === 0 ? (
            <p className="text-sm text-slate-400">No keywords yet. Add some above.</p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {data.keywords.map((k) => (
                <div key={k.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{k.keyword}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusChip[k.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {k.status.replace("_", " ")}
                      </span>
                    </div>
                    {k.error ? <div className="text-xs text-red-500">{k.error}</div> : null}
                    {k.post_slug ? (
                      <Link href={`/blogs/${k.post_slug}`} target="_blank" className="text-xs text-brand-600 hover:underline">
                        /blogs/{k.post_slug}
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {k.status === "failed" || k.status === "skipped_duplicate" ? (
                      <Button size="sm" variant="secondary" onClick={() => keywordAction("keyword_retry", k.id)}>Retry</Button>
                    ) : null}
                    <Button size="sm" variant="danger" onClick={() => keywordAction("keyword_delete", k.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {/* Posts */}
      {loaded && data ? (
        <Section title={`Posts (${data.posts.length})`}>
          {data.posts.length === 0 ? (
            <p className="text-sm text-slate-400">No posts yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {data.posts.map((p) => (
                <div key={p.slug} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/blogs/${p.slug}`} target="_blank" className="font-medium text-slate-800 hover:text-brand-600 hover:underline">
                        {p.title}
                      </Link>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusChip[p.status] ?? "bg-slate-100"}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {p.date}
                      {p.wordCount ? ` · ${p.wordCount} words` : ""}
                      {p.indexStatus && Object.keys(p.indexStatus).length
                        ? " · index: " + Object.entries(p.indexStatus).map(([e, r]) => `${e} ${r.ok ? "✓" : "✗"}`).join("  ")
                        : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.status === "published" ? (
                      <Button size="sm" variant="secondary" onClick={() => postAction("post_unpublish", p.slug)}>Unpublish</Button>
                    ) : (
                      <Button size="sm" onClick={() => postAction("post_publish", p.slug)}>Publish</Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => postAction("post_reindex", p.slug)}>Reindex</Button>
                    <Button size="sm" variant="danger" onClick={() => postAction("post_delete", p.slug)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {/* Cron + IndexNow info */}
      {data ? (
        <Section title="Unattended schedule">
          <p className="text-sm text-slate-600">
            Point a free cron service (e.g. cron-job.org) at this URL hourly. It publishes only when the
            cadence allows; otherwise it no-ops. Keep the URL private — it contains your token.
          </p>
          <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 text-xs text-emerald-300">{cronUrl}</code>
          <p className="mt-3 text-xs text-slate-400">
            IndexNow key: <code className="rounded bg-slate-100 px-1">{data.indexNowKey}</code> · served at{" "}
            <code className="rounded bg-slate-100 px-1">{data.publicUrl}/api/indexnow</code>
          </p>
        </Section>
      ) : null}
    </div>
  );
}
