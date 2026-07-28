import { NextResponse } from "next/server";
import { getDB } from "@/lib/server/db";
import { EMPTY_SNIPPETS, getSnippets } from "@/lib/server/snippets";

export const dynamic = "force-dynamic";

/**
 * Public read of the admin-configured custom code, consumed by
 * <SiteSnippets> in the root layout.
 *
 * Returns empty strings when disabled so the client injects nothing. Cached
 * briefly at the edge: every page load hits this, and snippets change rarely.
 */
export async function GET() {
  let data = EMPTY_SNIPPETS;
  try {
    const db = await getDB();
    const s = await getSnippets(db);
    if (s.enabled) data = s;
  } catch {
    // Table missing / D1 unavailable — inject nothing rather than break the page.
  }
  return NextResponse.json(
    { headHtml: data.headHtml, bodyHtml: data.bodyHtml },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } }
  );
}
