import { NextResponse } from "next/server";
import { getDB } from "@/lib/server/db";
import { getServerUser } from "@/lib/supabase/server";
import { isReceiptAction, recordReceiptEvent } from "@/lib/server/receiptEvents";

export const dynamic = "force-dynamic";

/**
 * Receipt-generation beacon — METADATA ONLY.
 *
 * The client posts { templateId, action }. We attribute the event to the
 * signed-in user from the SERVER-side Supabase session (never a client-supplied
 * id) and store nothing about the receipt's contents. Always 204; analytics
 * must never break an export.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      templateId?: unknown;
      action?: unknown;
    };

    const templateId =
      typeof body.templateId === "string" && body.templateId.trim()
        ? body.templateId.trim().slice(0, 64)
        : null;
    if (!templateId || !isReceiptAction(body.action)) {
      return new NextResponse(null, { status: 204 });
    }

    const user = await getServerUser().catch(() => null);

    const db = await getDB();
    await recordReceiptEvent(db, {
      templateId,
      action: body.action,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
    });
  } catch {
    // Swallow everything — D1 unavailable, migration not applied, etc.
  }
  return new NextResponse(null, { status: 204 });
}
