import { NextResponse } from "next/server";
import { getEnv } from "@/lib/server/db";
import { isAuthorized } from "@/lib/server/adminToken";
import { runScheduler } from "@/lib/server/blogScheduler";

export const dynamic = "force-dynamic";

/**
 * Scheduler tick for the Autopilot Blog. Designed for a free external cron
 * service (e.g. cron-job.org) hitting:
 *   /api/cron/run?token=<BLOG_ADMIN_TOKEN>
 *
 * Processes at most one queued keyword and only when the configured cadence
 * (interval + daily cap + min spacing) allows; otherwise it no-ops. Safe to
 * call frequently.
 */
async function handle(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const env = await getEnv();
  const result = await runScheduler({ DB: env.DB, AI: env.AI });
  return NextResponse.json(result);
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
