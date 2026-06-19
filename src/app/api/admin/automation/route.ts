import { NextResponse } from "next/server";
import { getDB } from "@/lib/server/db";
import { isAuthorized } from "@/lib/server/adminToken";
import { loadAutomation, saveAutomation } from "@/lib/server/blogAutomation";
import { listPublishedPosts } from "@/lib/server/blogStore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDB();
  const [config, posts] = await Promise.all([loadAutomation(db), listPublishedPosts(db, 30)]);
  return NextResponse.json({
    config,
    posts: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      source: p.source,
      keyword: p.keyword,
    })),
  });
}

export async function PUT(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: {
    keywords?: unknown;
    intervalHours?: unknown;
    author?: unknown;
    cover?: unknown;
    running?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = await getDB();
  const config = await saveAutomation(db, {
    keywords: Array.isArray(body.keywords)
      ? body.keywords.filter((k): k is string => typeof k === "string" && k.trim().length > 0).map((k) => k.trim())
      : undefined,
    intervalHours:
      typeof body.intervalHours === "number" && body.intervalHours >= 1
        ? Math.floor(body.intervalHours)
        : undefined,
    author: typeof body.author === "string" && body.author.trim() ? body.author.trim() : undefined,
    cover: typeof body.cover === "string" && body.cover.trim() ? body.cover.trim() : undefined,
    running: typeof body.running === "boolean" ? body.running : undefined,
  });
  return NextResponse.json({ ok: true, config });
}
