"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import type { AccountPatch, Plan, PublicUser } from "./account-types";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client";

/**
 * Client auth — now backed by Supabase Auth (email/password, Google OAuth,
 * magic link). The exported surface (useCurrentUser, useAuthLoaded, signUp,
 * logIn, logOut, updateCurrentUser, refreshCurrentUser) is unchanged from the
 * previous custom D1/session implementation, so consumers need no edits.
 *
 * Plan is currently always "free" (payments disabled via PAYMENTS_ENABLED);
 * when billing is re-enabled it will be derived from the subscription record
 * keyed by the Supabase user id.
 */

export type { Plan, PublicUser } from "./account-types";
export type AuthResult = { ok: true } | { ok: false; error: string };
export type SignUpResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false; error: string };

function toPublicUser(u: User): PublicUser {
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    (u.email ? u.email.split("@")[0] : "") ||
    "";
  const avatar =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    undefined;
  const provider = u.app_metadata?.provider === "google" ? "google" : "email";
  return {
    id: u.id,
    name: String(name).trim(),
    email: u.email ?? "",
    plan: "free" as Plan,
    blogSubscribed: meta.blog_subscribed === true,
    createdAt: u.created_at ?? new Date().toISOString(),
    avatarUrl: avatar,
    provider,
  };
}

// --- external store ---
const listeners = new Set<() => void>();
let snapshot: PublicUser | null = null;
let loaded = false;
let started = false;

function emit(): void {
  listeners.forEach((l) => l());
}

function setUser(u: User | null): void {
  snapshot = u ? toPublicUser(u) : null;
  loaded = true;
  emit();
}

function start(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  if (!isSupabaseConfigured()) {
    loaded = true;
    emit();
    return;
  }
  const supabase = getSupabaseBrowserClient();
  supabase.auth
    .getUser()
    .then(({ data }) => setUser(data.user ?? null))
    .catch(() => setUser(null));
  // Keep the store in sync with sign-in / sign-out / token refresh.
  supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
}

/** Force a refresh of the cached current user. */
export async function refreshCurrentUser(): Promise<void> {
  if (typeof window === "undefined" || !isSupabaseConfigured()) return;
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getUser();
  setUser(data.user ?? null);
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  start();
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): PublicUser | null {
  return snapshot;
}

function getServerSnapshot(): PublicUser | null {
  return null;
}

/** Reactive current-user hook. Returns null when signed out or still loading. */
export function useCurrentUser(): PublicUser | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getLoadedSnapshot(): boolean {
  return loaded;
}

/** True once the current-user check has resolved at least once. */
export function useAuthLoaded(): boolean {
  return useSyncExternalStore(subscribe, getLoadedSnapshot, () => false);
}

// --- imperative API ---

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<SignUpResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Sign-in is not configured yet." };
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name.trim() },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) return { ok: false, error: error.message };
  // When email confirmation is on, there's no session until the user confirms.
  const needsConfirmation = !data.session;
  if (data.session) await refreshCurrentUser();
  return { ok: true, needsConfirmation };
}

export async function logIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Sign-in is not configured yet." };
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  await refreshCurrentUser();
  return { ok: true };
}

/** Start Google OAuth (redirects to Google, returns via /auth/callback). */
export async function signInWithGoogle(next = "/dashboard"): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Sign-in is not configured yet." };
  const supabase = getSupabaseBrowserClient();
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Send a passwordless magic-link sign-in email. */
export async function sendMagicLink(email: string, next = "/dashboard"): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Sign-in is not configured yet." };
  const supabase = getSupabaseBrowserClient();
  const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function logOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
  setUser(null);
}

/** Patch the signed-in user's profile (name, newsletter opt-in) in user_metadata. */
export async function updateCurrentUser(patch: AccountPatch): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseBrowserClient();
  const data: Record<string, unknown> = {};
  if (patch.name !== undefined) data.name = patch.name.trim();
  if (patch.blogSubscribed !== undefined) data.blog_subscribed = patch.blogSubscribed;
  if (Object.keys(data).length > 0) {
    await supabase.auth.updateUser({ data });
    await refreshCurrentUser();
  }
}
