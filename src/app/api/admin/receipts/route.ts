import { NextResponse } from "next/server";
import { getDB } from "@/lib/server/db";
import { isAuthorized } from "@/lib/server/adminToken";
import { getReceiptStats } from "@/lib/server/receiptEvents";

export const dynamic = "force-dynamic";

/**
 * Admin readout of receipt-generation activity — METADATA ONLY (which template,
 * which action, when, by whom). Receipt contents are never stored, so they
 * cannot be listed here by design. Gated by BLOG_ADMIN_TOKEN.
 * GET /api/admin/receipts?token=…&days=30
 */
export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const daysParam = Number(new URL(req.url).searchParams.get("days"));
  const days = Number.isFinite(daysParam) && daysParam > 0 && daysParam <= 365 ? daysParam : 30;

  try {
    const db = await getDB();
    const stats = await getReceiptStats(db, days);
    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json(
      {
        error: "Receipt activity unavailable. Has migration 0006 been applied?",
        detail: String(e),
      },
      { status: 503 }
    );
  }
}
