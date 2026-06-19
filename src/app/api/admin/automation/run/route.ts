import { NextResponse } from "next/server";
import { getEnv } from "@/lib/server/db";
import { isAuthorized } from "@/lib/server/adminToken";
import { runDueAutomation } from "@/lib/server/blogAutomation";

export const dynamic = "force-dynamic";

/** Manual "Generate now" — publishes one post immediately, bypassing the interval. */
export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const env = await getEnv();
  const result = await runDueAutomation({ DB: env.DB, AI: env.AI }, { force: true });
  return NextResponse.json(result);
}
