import { cookies } from "next/headers";
import type { PublicUser } from "@/lib/account-types";
import { getDB } from "./db";
import { getUserById } from "./users";

export const SESSION_COOKIE = "re_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function newToken(): string {
  // 256 bits of randomness, base64url.
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Create a session row + set the httpOnly session cookie. */
export async function createSession(userId: string): Promise<void> {
  const db = await getDB();
  const token = newToken();
  const now = Date.now();
  const expires = now + SESSION_TTL_MS;
  await db
    .prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(token, userId, expires, now)
    .run();

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

/** Resolve the current user from the session cookie, or null. */
export async function getSessionUser(): Promise<PublicUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await getDB();
  const row = await db
    .prepare("SELECT user_id, expires_at FROM sessions WHERE id = ?")
    .bind(token)
    .first<{ user_id: string; expires_at: number }>();
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
    return null;
  }
  return getUserById(row.user_id);
}

/** Delete the current session row and clear the cookie. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDB();
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
  }
  jar.delete(SESSION_COOKIE);
}
