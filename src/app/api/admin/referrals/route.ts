import { NextResponse } from "next/server";
import { getDB } from "@/lib/server/db";
import { isAuthorized } from "@/lib/server/adminToken";
import { getReferralStats } from "@/lib/server/referralStore";

export const dynamic = "force-dynamic";

/**
 * Admin readout of first-party referral analytics, with AI answer engines
 * broken out. Gated by the same BLOG_ADMIN_TOKEN as the other admin routes.
 * GET /api/admin/referrals?token=…&days=30
 */
export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const daysParam = Number(new URL(req.url).searchParams.get("days"));
  const days = Number.isFinite(daysParam) && daysParam > 0 && daysParam <= 365 ? daysParam : 30;

  try {
    const db = await getDB();
    const stats = await getReferralStats(db, days);
    return NextResponse.json(stats);
  } catch (e) {
    // Table may not exist yet (migration 0005 not applied) — report cleanly.
    return NextResponse.json(
      { error: "Referral stats unavailable. Has migration 0005 been applied?", detail: String(e) },
      { status: 503 }
    );
  }
}
