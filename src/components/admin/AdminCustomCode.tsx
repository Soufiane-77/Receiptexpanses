"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSettings } from "@/lib/adminSettings";
import { AdminButton, AdminField, Badge, Banner, Card, PageHeader } from "./ui";

const MAX = 20_000;

const textareaCls =
  "w-full rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 font-mono text-[13px] leading-relaxed text-[#303030] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#a0a0a0] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export default function AdminCustomCode() {
  const [token, setToken] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [headHtml, setHeadHtml] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async (tok: string) => {
    if (!tok) {
      setErr("Add your admin API token under Security to load and save custom code.");
      return;
    }
    setLoading(true);
    setErr("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/snippets", { headers: { "x-admin-token": tok } });
      const body = (await res.json().catch(() => ({}))) as {
        enabled?: boolean;
        headHtml?: string;
        bodyHtml?: string;
        error?: string;
      };
      if (!res.ok) {
        setErr(
          body.error ||
            (res.status === 401
              ? "Unauthorized — the token doesn't match BLOG_ADMIN_TOKEN."
              : `Couldn't load custom code (${res.status}).`)
        );
      } else {
        setEnabled(Boolean(body.enabled));
        setHeadHtml(body.headHtml ?? "");
        setBodyHtml(body.bodyHtml ?? "");
        setDirty(false);
      }
    } catch {
      setErr("Network error while loading custom code.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const tok = loadSettings().automationToken ?? "";
    setToken(tok);
    void load(tok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (nextEnabled?: boolean) => {
    if (!token) return setErr("Add your admin API token under Security first.");
    setSaving(true);
    setErr("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          enabled: nextEnabled ?? enabled,
          headHtml,
          bodyHtml,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; enabled?: boolean };
      if (!res.ok) {
        setErr(body.error || `Couldn't save (${res.status}).`);
      } else {
        if (typeof body.enabled === "boolean") setEnabled(body.enabled);
        setDirty(false);
        setNotice("Saved. Changes are live within a minute (edge cache).");
      }
    } catch {
      setErr("Network error while saving.");
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader
        title="Custom code"
        subtitle="Paste analytics tags, pixels or custom styles to inject into every public page."
        actions={
          <>
            <AdminButton onClick={() => load(token)} disabled={loading || saving}>
              {loading ? "Reloading…" : "Reload"}
            </AdminButton>
            <AdminButton tone="primary" onClick={() => save()} disabled={saving || !token}>
              {saving ? "Saving…" : "Save"}
            </AdminButton>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <Banner tone="warning" title="This code runs on every visitor's page">
          Anything you paste here executes in your customers&apos; browsers. Only add code from
          sources you trust, and double-check it before enabling — a broken tag can slow down or
          break the site.
        </Banner>

        {err ? (
          <Banner tone="critical" title="Problem">
            {err}
          </Banner>
        ) : null}
        {notice ? <Banner tone="success">{notice}</Banner> : null}
      </div>

      {/* Master switch */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#303030]">Status</span>
              {enabled ? <Badge tone="success">Live</Badge> : <Badge tone="neutral">Off</Badge>}
            </div>
            <p className="mt-1 text-sm text-[#616161]">
              {enabled
                ? "Your code is being injected into every public page."
                : "Nothing is injected. Turn this on once your code is ready."}
            </p>
          </div>
          <AdminButton
            tone={enabled ? "critical" : "primary"}
            onClick={() => save(!enabled)}
            disabled={saving || !token}
          >
            {enabled ? "Turn off" : "Turn on"}
          </AdminButton>
        </div>
      </Card>

      {/* Head */}
      <Card
        className="mb-4"
        title="Head code"
        description="Injected into <head>. Use for analytics (GA4, GTM), pixels and <style> blocks."
        actions={
          <span className="text-xs tabular-nums text-[#8a8a8a]">
            {headHtml.length.toLocaleString()} / {MAX.toLocaleString()}
          </span>
        }
      >
        <AdminField
          label="HTML"
          htmlFor="cc-head"
          hint="Paste complete tags, e.g. <script async src='https://www.googletagmanager.com/gtag/js?id=G-XXXX'></script>"
        >
          <textarea
            id="cc-head"
            rows={10}
            value={headHtml}
            maxLength={MAX}
            spellCheck={false}
            onChange={(e) => {
              setHeadHtml(e.target.value);
              setDirty(true);
            }}
            placeholder="<!-- Google tag (gtag.js) -->"
            className={textareaCls}
          />
        </AdminField>
      </Card>

      {/* Body */}
      <Card
        title="Body end code"
        description="Injected just before </body>. Use for chat widgets and no-script fallbacks."
        actions={
          <span className="text-xs tabular-nums text-[#8a8a8a]">
            {bodyHtml.length.toLocaleString()} / {MAX.toLocaleString()}
          </span>
        }
      >
        <AdminField label="HTML" htmlFor="cc-body">
          <textarea
            id="cc-body"
            rows={8}
            value={bodyHtml}
            maxLength={MAX}
            spellCheck={false}
            onChange={(e) => {
              setBodyHtml(e.target.value);
              setDirty(true);
            }}
            placeholder="<!-- e.g. chat widget -->"
            className={textareaCls}
          />
        </AdminField>
      </Card>

      {dirty ? (
        <div className="sticky bottom-4 mt-4 flex justify-end">
          <div className="flex items-center gap-3 rounded-xl border border-[#e3e3e3] bg-white px-4 py-3 shadow-lg">
            <span className="text-sm text-[#616161]">Unsaved changes</span>
            <AdminButton tone="primary" onClick={() => save()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </AdminButton>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <Banner tone="info" title="Verifying a site with Google or Bing?">
          Meta tags added here are injected by JavaScript, which search engines don&apos;t reliably
          read for <em>site verification</em>. Use the HTML-file or DNS method instead — the same way{" "}
          <code className="font-mono text-xs">BingSiteAuth.xml</code> is already set up. Analytics
          and pixels work fine here.
        </Banner>
      </div>
    </>
  );
}
