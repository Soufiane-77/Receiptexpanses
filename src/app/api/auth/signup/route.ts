import { NextResponse } from "next/server";
import { createUser } from "@/lib/server/users";
import { createSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!name) return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });

  const result = await createUser(name, email, password);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 409 });

  await createSession(result.user.id);
  return NextResponse.json({ ok: true, user: result.user });
}
