import { NextResponse } from "next/server";
import { getDB } from "@/lib/server/db";
import { classifyReferrer } from "@/lib/referrer";

export const dynamic = "force-dynamic";

/**
 * Cookieless first-party referral beacon. The client posts { referrer, path,
 * search } once per session; we classify it (with first-class AI-engine
 * detection) and store a PII-free row in D1. Always returns 204 and never
 * throws to the caller — analytics must never break a page load.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      referrer?: unknown;
      path?: unknown;
      search?: unknown;
    };

    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 2048) : "";
    const path = typeof body.path === "string" ? sanitizePath(body.path) : "/";
    const search = typeof body.search === "string" ? body.search.slice(0, 1024) : "";

    const params = safeParams(search);
    const c = classifyReferrer(referrer, params);

    // Never persist the same-origin referrer as a "referral" — that's just
    // internal navigation the client should have filtered, but guard anyway.
    const referrerHost = hostOnly(referrer);

    const now = new Date();
    const day = now.toISOString().slice(0, 10);

    const db = await getDB();
    await db
      .prepare(
        `INSERT INTO referral_events
           (day, source, label, medium, is_ai, referrer_host, landing_path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(day, c.source, c.label, c.medium, c.isAI ? 1 : 0, referrerHost, path)
      .run();
  } catch {
    // Swallow everything — D1 unavailable, malformed body, etc.
  }
  return new NextResponse(null, { status: 204 });
}

function sanitizePath(p: string): string {
  const noQuery = p.split("?")[0]!.split("#")[0]!;
  return noQuery.slice(0, 256) || "/";
}

function safeParams(search: string): URLSearchParams | undefined {
  try {
    return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  } catch {
    return undefined;
  }
}

function hostOnly(referrer: string): string | null {
  try {
    return new URL(referrer).hostname.toLowerCase().slice(0, 253);
  } catch {
    return null;
  }
}
