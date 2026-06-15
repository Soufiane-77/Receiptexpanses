import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/server/users";
import { createSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  const result = await verifyCredentials(email, password);
  if (!result.ok)
    return NextResponse.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });

  await createSession(result.user.id);
  return NextResponse.json({ ok: true, user: result.user });
}
