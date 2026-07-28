import { NextResponse } from "next/server";
import { getDB } from "@/lib/server/db";
import { isAuthorized } from "@/lib/server/adminToken";
import { MAX_SNIPPET_CHARS, getSnippets, saveSnippets } from "@/lib/server/snippets";

export const dynamic = "force-dynamic";

/**
 * Read/write the site-wide custom code snippets.
 *
 * SECURITY: writing here injects arbitrary HTML/JS into every visitor's page,
 * so both verbs are gated by BLOG_ADMIN_TOKEN (a Worker secret) — never by the
 * client-side admin password.
 */
export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const db = await getDB();
    return NextResponse.json(await getSnippets(db));
  } catch (e) {
    return NextResponse.json(
      { error: "Snippets unavailable. Has migration 0007 been applied?", detail: String(e) },
      { status: 503 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { enabled?: unknown; headHtml?: unknown; bodyHtml?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const headHtml = typeof body.headHtml === "string" ? body.headHtml : undefined;
  const bodyHtml = typeof body.bodyHtml === "string" ? body.bodyHtml : undefined;
  if (
    (headHtml && headHtml.length > MAX_SNIPPET_CHARS) ||
    (bodyHtml && bodyHtml.length > MAX_SNIPPET_CHARS)
  ) {
    return NextResponse.json(
      { error: `Each snippet must be under ${MAX_SNIPPET_CHARS.toLocaleString()} characters.` },
      { status: 400 }
    );
  }

  try {
    const db = await getDB();
    const saved = await saveSnippets(db, {
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      headHtml,
      bodyHtml,
    });
    return NextResponse.json({ ok: true, ...saved });
  } catch (e) {
    return NextResponse.json(
      { error: "Could not save snippets. Has migration 0007 been applied?", detail: String(e) },
      { status: 503 }
    );
  }
}
