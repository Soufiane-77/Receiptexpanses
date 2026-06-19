import { getDB } from "@/lib/server/db";
import { ensureIndexNowKey } from "@/lib/server/blogSettings";

export const dynamic = "force-dynamic";

/**
 * IndexNow key verification endpoint. Search engines fetch this URL (passed as
 * `keyLocation`) and check the body equals the submitted key. Public on purpose
 * — the key only proves we control this host.
 */
export async function GET() {
  try {
    const db = await getDB();
    const key = await ensureIndexNowKey(db);
    return new Response(key, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return new Response("indexnow key unavailable", { status: 503 });
  }
}
