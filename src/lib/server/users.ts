import type { AccountPatch, Plan, PublicUser } from "@/lib/account-types";
import type { GoogleProfile } from "./oauth";
import { getDB } from "./db";
import { hashPassword, verifyPassword } from "./password";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  password_salt: string;
  plan: string;
  pro_since: number | null;
  blog_subscribed: number;
  created_at: number;
  updated_at: number;
  // Added in migration 0004 (Google OAuth). Nullable on rows created earlier.
  google_id: string | null;
  avatar_url: string | null;
  auth_provider: string | null;
};

function rowToPublic(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email,
    plan: (row.plan === "pro" ? "pro" : "free") as Plan,
    proSince: row.pro_since ? new Date(row.pro_since).toISOString() : undefined,
    blogSubscribed: row.blog_subscribed === 1,
    createdAt: new Date(row.created_at).toISOString(),
    avatarUrl: row.avatar_url ?? undefined,
    provider: row.auth_provider === "google" ? "google" : "email",
  };
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const db = await getDB();
  const row = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  return row ? rowToPublic(row) : null;
}

export type CreateUserResult =
  | { ok: true; user: PublicUser }
  | { ok: false; error: string };

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<CreateUserResult> {
  const db = await getDB();
  const normalized = email.trim().toLowerCase();

  const existing = await db
    .prepare("SELECT id FROM users WHERE email = ?")
    .bind(normalized)
    .first<{ id: string }>();
  if (existing) return { ok: false, error: "An account with that email already exists." };

  const { hash, salt } = await hashPassword(password);
  const now = Date.now();
  const id = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO users (id, email, name, password_hash, password_salt, plan, blog_subscribed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'free', 0, ?, ?)`
    )
    .bind(id, normalized, name.trim(), hash, salt, now, now)
    .run();

  return { ok: true, user: { id, name: name.trim(), email: normalized, plan: "free", blogSubscribed: false, createdAt: new Date(now).toISOString() } };
}

export type VerifyResult = { ok: true; user: PublicUser } | { ok: false };

export async function verifyCredentials(email: string, password: string): Promise<VerifyResult> {
  const db = await getDB();
  const normalized = email.trim().toLowerCase();
  const row = await db.prepare("SELECT * FROM users WHERE email = ?").bind(normalized).first<UserRow>();
  if (!row) return { ok: false };
  // OAuth-only accounts have no password (empty hash) — reject password login.
  if (!row.password_hash) return { ok: false };
  const valid = await verifyPassword(password, row.password_hash, row.password_salt);
  if (!valid) return { ok: false };
  return { ok: true, user: rowToPublic(row) };
}

/**
 * Resolve the local account for a Google profile, creating one if needed.
 *
 * Matching order: by Google id, then by email (links Google to an existing
 * email/password account), else create a new passwordless account. Returns the
 * public user — never fails for a valid profile.
 */
export async function findOrCreateGoogleUser(profile: GoogleProfile): Promise<PublicUser> {
  const db = await getDB();
  const email = profile.email.trim().toLowerCase();
  const now = Date.now();

  // 1) Existing account already linked to this Google identity.
  let row = await db
    .prepare("SELECT * FROM users WHERE google_id = ?")
    .bind(profile.sub)
    .first<UserRow>();

  // 2) Existing email account — link the Google identity to it.
  if (!row) {
    const byEmail = await db
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first<UserRow>();
    if (byEmail) {
      await db
        .prepare(
          "UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), updated_at = ? WHERE id = ?"
        )
        .bind(profile.sub, profile.picture ?? null, now, byEmail.id)
        .run();
      row = await db.prepare("SELECT * FROM users WHERE id = ?").bind(byEmail.id).first<UserRow>();
    }
  }

  // 3) Brand-new passwordless Google account.
  if (!row) {
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO users (id, email, name, password_hash, password_salt, google_id, avatar_url, auth_provider, plan, blog_subscribed, created_at, updated_at)
         VALUES (?, ?, ?, '', '', ?, ?, 'google', 'free', 0, ?, ?)`
      )
      .bind(id, email, profile.name.trim(), profile.sub, profile.picture ?? null, now, now)
      .run();
    row = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  }

  // row is guaranteed set by one of the three branches above.
  return rowToPublic(row as UserRow);
}

/** Patch a user's own mutable fields. Returns the updated public user. */
export async function updateUser(id: string, patch: AccountPatch): Promise<PublicUser | null> {
  const db = await getDB();
  const sets: string[] = [];
  const values: unknown[] = [];

  if (patch.name !== undefined) {
    sets.push("name = ?");
    values.push(patch.name.trim());
  }
  if (patch.blogSubscribed !== undefined) {
    sets.push("blog_subscribed = ?");
    values.push(patch.blogSubscribed ? 1 : 0);
  }
  if (patch.plan !== undefined) {
    sets.push("plan = ?");
    values.push(patch.plan === "pro" ? "pro" : "free");
  }
  if (patch.proSince !== undefined) {
    sets.push("pro_since = ?");
    values.push(patch.proSince ? Date.parse(patch.proSince) : null);
  }

  if (sets.length > 0) {
    sets.push("updated_at = ?");
    values.push(Date.now());
    values.push(id);
    await db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
  }
  return getUserById(id);
}
