import { NextResponse } from "next/server";
import { getDB, getEnv } from "@/lib/server/db";
import { isAuthorized } from "@/lib/server/adminToken";
import { SITE_URL } from "@/lib/seo";
import {
  ensureIndexNowKey,
  loadSettings,
  publishedTodayCount,
  saveSettings,
  type SettingsPatch,
} from "@/lib/server/blogSettings";
import {
  deleteKeyword,
  deletePost,
  enqueueKeywords,
  listAllPosts,
  listKeywords,
  retryKeyword,
  setPostStatus,
} from "@/lib/server/blogStore";
import { runScheduler } from "@/lib/server/blogScheduler";
import { submitForIndexing } from "@/lib/server/blogIndexing";

export const dynamic = "force-dynamic";

/** Dashboard state for /admin/blog. */
export async function GET(req: Request) {
  if (!(await isAuthorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDB();
  const [settings, keywords, posts, indexNowKey] = await Promise.all([
    loadSettings(db),
    listKeywords(db),
    listAllPosts(db),
    ensureIndexNowKey(db),
  ]);
  return NextResponse.json({
    settings,
    keywords,
    posts: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      status: p.status,
      source: p.source,
      date: p.date,
      keyword: p.keyword,
      wordCount: p.wordCount,
      indexStatus: p.indexStatus ?? {},
    })),
    indexNowKey,
    publicUrl: SITE_URL,
    publishedToday: publishedTodayCount(settings),
  });
}

function parseKeywords(input: unknown): string[] {
  const text = Array.isArray(input) ? input.join("\n") : typeof input === "string" ? input : "";
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Action dispatcher: save settings, manage keywords/posts, run a tick. */
export async function POST(req: Request) {
  if (!(await isAuthorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { action?: string; [k: string]: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = await getDB();
  const action = body.action;

  switch (action) {
    case "save_settings": {
      const patch = (body.settings ?? {}) as SettingsPatch;
      const settings = await saveSettings(db, patch);
      return NextResponse.json({ ok: true, settings });
    }
    case "add_keywords": {
      const result = await enqueueKeywords(db, parseKeywords(body.keywords));
      return NextResponse.json({ ok: true, ...result });
    }
    case "keyword_retry": {
      await retryKeyword(db, Number(body.id));
      return NextResponse.json({ ok: true });
    }
    case "keyword_delete": {
      await deleteKeyword(db, Number(body.id));
      return NextResponse.json({ ok: true });
    }
    case "run_now": {
      const env = await getEnv();
      const result = await runScheduler({ DB: env.DB, AI: env.AI }, { force: true });
      return NextResponse.json(result);
    }
    case "post_publish":
    case "post_unpublish": {
      const slug = String(body.slug);
      const status = action === "post_publish" ? "published" : "draft";
      await setPostStatus(db, slug, status);
      const index = status === "published" ? await submitForIndexing(db, slug) : undefined;
      return NextResponse.json({ ok: true, status, index });
    }
    case "post_reindex": {
      const index = await submitForIndexing(db, String(body.slug));
      return NextResponse.json({ ok: true, index });
    }
    case "post_delete": {
      await deletePost(db, String(body.slug));
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
