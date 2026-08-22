"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSettings } from "@/lib/adminSettings";
import {
  AdminButton,
  Badge,
  Banner,
  Card,
  EmptyState,
  PageHeader,
  StatTile,
  Table,
  Td,
  Tr,
} from "./ui";

type Analytics = {
  posts: { total: number; published: number; draft: number; auto: number; manual: number };
  images: { withCover: number; withoutCover: number };
  quality: { avgWords: number; minWords: number; maxWords: number; belowFloor: number };
  queue: { queued: number; published: number; failed: number; processing: number };
  perDay: { day: string; count: number }[];
  recent: {
    slug: string;
    title: string;
    status: string;
    words: number;
    hasImage: number;
    keyword: string | null;
    createdAt: number;
  }[];
  failures: { keyword: string; error: string }[];
  scheduler: {
    running: boolean;
    autoPublish: boolean;
    intervalHours: number;
    dailyCap: number;
    publishedToday: number;
    lastRunAt: number;
    minWordCount: number;
  };
  error?: string;
};

type BackfillItem = { slug: string; ok: boolean; images: number; detail: string };

export default function AdminBlogAnalytics() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Analytics | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [backfill, setBackfill] = useState<{
    updated: number;
    skipped: number;
    items: BackfillItem[];
  } | null>(null);

  const call = useCallback(async (tok: string, payload: Record<string, unknown>) => {
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": tok },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, status: res.status, body };
  }, []);

  const load = useCallback(
    async (tok: string) => {
      if (!tok) {
        setErr("Add your admin API token under Security first.");
        return;
      }
      setLoading(true);
      setErr("");
      const { ok, status, body } = await call(tok, { action: "analytics", days: 30 });
      if (!ok) {
        setErr(
          (body.error as string) ||
            (status === 401
              ? "Unauthorized — the token does not match BLOG_ADMIN_TOKEN."
              : `Failed (${status}).`),
        );
      } else {
        setData(body as unknown as Analytics);
      }
      setLoading(false);
    },
    [call],
  );

  useEffect(() => {
    const tok = loadSettings().automationToken ?? "";
    setToken(tok);
    void load(tok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runBackfill = async () => {
    setBackfilling(true);
    setErr("");
    setBackfill(null);
    const { ok, status, body } = await call(token, {
      action: "backfill_images",
      perPost: 3,
      limit: 100,
    });
    if (!ok) {
      setErr((body.error as string) || `Backfill failed (${status}).`);
    } else {
      setBackfill({
        updated: Number(body.updated ?? 0),
        skipped: Number(body.skipped ?? 0),
        items: (body.items as BackfillItem[]) ?? [],
      });
      await load(token);
    }
    setBackfilling(false);
  };

  const runRehost = async () => {
    setBackfilling(true);
    setErr("");
    setBackfill(null);
    const { ok, status, body } = await call(token, { action: "rehost_images", limit: 100 });
    if (!ok) {
      setErr((body.error as string) || `Re-host failed (${status}).`);
    } else {
      const items = (body.items as { slug: string; rehosted: number; detail: string }[]) ?? [];
      setBackfill({
        updated: Number(body.postsChanged ?? 0),
        skipped: Number(body.scanned ?? 0) - Number(body.postsChanged ?? 0),
        items: items.map((i) => ({
          slug: i.slug,
          ok: i.rehosted > 0,
          images: i.rehosted,
          detail: i.detail,
        })),
      });
      await load(token);
    }
    setBackfilling(false);
  };

  const maxDay = Math.max(1, ...(data?.perDay ?? []).map((d) => d.count));
  const s = data?.scheduler;

  return (
    <>
      <PageHeader
        title="Blog analytics"
        subtitle="How the autopilot is performing: output, quality, image coverage and queue burn-down."
        actions={
          <>
            <AdminButton onClick={() => load(token)} disabled={loading || backfilling}>
              {loading ? "Refreshing…" : "Refresh"}
            </AdminButton>
            <AdminButton onClick={runRehost} disabled={backfilling || !token}>
              {backfilling ? "Working…" : "Self-host images"}
            </AdminButton>
            <AdminButton tone="primary" onClick={runBackfill} disabled={backfilling || !token}>
              {backfilling ? "Adding images…" : "Backfill images"}
            </AdminButton>
          </>
        }
      />

      {err ? (
        <div className="mb-4">
          <Banner tone="critical" title="Problem">
            {err}
          </Banner>
        </div>
      ) : null}

      {backfill ? (
        <div className="mb-4">
          <Banner
            tone={backfill.updated > 0 ? "success" : "warning"}
            title={`Backfill: ${backfill.updated} updated, ${backfill.skipped} already had images`}
          >
            {backfill.items.length ? (
              <ul className="mt-1 flex flex-col gap-0.5 text-xs">
                {backfill.items.slice(0, 10).map((i) => (
                  <li key={i.slug}>
                    <strong>
                      {i.ok ? "✓" : "✗"} {i.slug}
                    </strong>{" "}
                    — {i.detail}
                  </li>
                ))}
              </ul>
            ) : null}
          </Banner>
        </div>
      ) : null}

      {s ? (
        <Card className="mb-4" title="Scheduler">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#616161]">
            {s.running ? (
              <Badge tone="success">Running</Badge>
            ) : (
              <Badge tone="critical">Paused</Badge>
            )}
            {s.autoPublish ? (
              <Badge tone="info">Auto-publish</Badge>
            ) : (
              <Badge tone="neutral">Draft mode</Badge>
            )}
            <span>
              every {s.intervalHours}h · cap {s.dailyCap}/day · {s.publishedToday} today · floor{" "}
              {s.minWordCount} words
            </span>
            <span className="text-[#8a8a8a]">
              last run {s.lastRunAt ? new Date(s.lastRunAt).toLocaleString() : "never"}
            </span>
          </div>
        </Card>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              label="Posts"
              value={String(data.posts.total)}
              hint={`${data.posts.published} published · ${data.posts.draft} draft`}
            />
            <StatTile
              label="Auto-generated"
              value={String(data.posts.auto)}
              hint={`${data.posts.manual} manual`}
            />
            <StatTile
              label="With images"
              value={`${data.images.withCover}/${data.posts.total}`}
              hint={`${data.images.withoutCover} missing`}
            />
            <StatTile
              label="Avg words"
              value={String(data.quality.avgWords)}
              hint={`${data.quality.minWords}–${data.quality.maxWords}`}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="Queued" value={String(data.queue.queued)} hint="Keywords remaining" />
            <StatTile
              label="Consumed"
              value={String(data.queue.published)}
              hint="Keywords published"
            />
            <StatTile label="Failed" value={String(data.queue.failed)} />
            <StatTile
              label="Below floor"
              value={String(data.quality.belowFloor)}
              hint="Thin posts"
            />
          </div>

          {data.perDay.length > 0 ? (
            <Card className="mt-4" title="Posts per day · last 30 days">
              <div
                className="flex h-28 items-end gap-1"
                role="img"
                aria-label="Posts published per day over the last 30 days"
              >
                {data.perDay.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 rounded-t bg-brand-500/80 transition-colors hover:bg-brand-600"
                    style={{ height: `${Math.max(6, (d.count / maxDay) * 100)}%` }}
                    title={`${d.day}: ${d.count}`}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-[#8a8a8a]">
                <span>{data.perDay[0]?.day}</span>
                <span>{data.perDay[data.perDay.length - 1]?.day}</span>
              </div>
            </Card>
          ) : null}

          {data.failures.length > 0 ? (
            <Card className="mt-4" title="Recent failures" padding={false}>
              <Table head={["Keyword", "Reason"]}>
                {data.failures.map((f, i) => (
                  <Tr key={i}>
                    <Td strong>{f.keyword}</Td>
                    <Td>{f.error}</Td>
                  </Tr>
                ))}
              </Table>
            </Card>
          ) : null}

          <Card className="mt-4" title="Recent posts" padding={false}>
            {data.recent.length === 0 ? (
              <EmptyState
                title="No posts yet"
                description="Run the scheduler to generate the first one."
              />
            ) : (
              <Table head={["Title", "Keyword", "Words", "Image", "Status"]}>
                {data.recent.map((p) => (
                  <Tr key={p.slug}>
                    <Td strong>
                      <a
                        href={`/blogs/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {p.title}
                      </a>
                    </Td>
                    <Td>{p.keyword ?? "—"}</Td>
                    <Td numeric>{p.words || "—"}</Td>
                    <Td>
                      {p.hasImage ? (
                        <Badge tone="success">Yes</Badge>
                      ) : (
                        <Badge tone="warning">No</Badge>
                      )}
                    </Td>
                    <Td>
                      {p.status === "published" ? (
                        <Badge tone="success">Published</Badge>
                      ) : (
                        <Badge tone="neutral">{p.status}</Badge>
                      )}
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
