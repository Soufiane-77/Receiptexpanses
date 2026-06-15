import { NextResponse } from "next/server";
import type { AccountPatch } from "@/lib/account-types";
import { getSessionUser } from "@/lib/server/session";
import { updateUser } from "@/lib/server/users";

export const dynamic = "force-dynamic";

// Patch the signed-in user's own account fields (name, newsletter opt-in).
// NOTE: `plan`/`proSince` are accepted here only as a stopgap until Stripe
// billing drives plan changes authoritatively via the webhook.
export async function POST(req: Request) {
  const current = await getSessionUser();
  if (!current) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let body: AccountPatch;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const patch: AccountPatch = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.blogSubscribed === "boolean") patch.blogSubscribed = body.blogSubscribed;
  if (body.plan === "free" || body.plan === "pro") patch.plan = body.plan;
  if (typeof body.proSince === "string" || body.proSince === undefined) patch.proSince = body.proSince;

  const user = await updateUser(current.id, patch);
  return NextResponse.json({ ok: true, user });
}
