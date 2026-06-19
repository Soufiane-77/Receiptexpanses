import { NextResponse } from "next/server";
import { getEnv } from "@/lib/server/db";
import { isAuthorized } from "@/lib/server/adminToken";
import { runDueAutomation } from "@/lib/server/blogAutomation";

export const dynamic = "force-dynamic";

/**
 * Scheduler tick. Called by the native Cloudflare Cron Trigger (via the worker
 * scheduled() handler) and usable as a fallback by any external free cron
 * service (e.g. cron-job.org) with `?token=<BLOG_ADMIN_TOKEN>`. Publishes one
 * post only if the configured interval has elapsed; otherwise no-ops.
 */
async function handle(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const env = await getEnv();
  const result = await runDueAutomation({ DB: env.DB, AI: env.AI });
  return NextResponse.json(result);
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
