"use client";

import { useSyncExternalStore } from "react";
import type { AccountPatch, Plan, PublicUser } from "./account-types";

/**
 * Client auth: thin wrapper over the server session endpoints
 * (/api/auth/*, /api/account). The current user is fetched from /api/auth/me
 * and cached in a module-level store so hooks re-render on change.
 *
 * The exported surface (useCurrentUser, signUp, logIn, logOut,
 * updateCurrentUser) is unchanged from the previous localStorage simulation,
 * except the imperative calls are now async.
 */

export type { Plan, PublicUser } from "./account-types";
export type AuthResult = { ok: true } | { ok: false; error: string };

// --- external store ---
const listeners = new Set<() => void>();
let snapshot: PublicUser | null = null;
let loaded = false;
let inFlight: Promise<void> | null = null;

function emit(): void {
  listeners.forEach((l) => l());
}

async function fetchMe(): Promise<void> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    const data = (await res.json()) as { user: PublicUser | null };
    snapshot = data.user ?? null;
  } catch {
    snapshot = null;
  } finally {
    loaded = true;
    emit();
  }
}

/** Force a refresh of the cached current user. */
export function refreshCurrentUser(): Promise<void> {
  inFlight = fetchMe();
  return inFlight;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (!loaded && !inFlight) {
    inFlight = fetchMe();
  }
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

/**
 * True once the current-user fetch has resolved at least once. Use this to
 * avoid acting on a transient `null` (loading) — e.g. before redirecting a
 * signed-out user to /login.
 */
export function useAuthLoaded(): boolean {
  return useSyncExternalStore(subscribe, getLoadedSnapshot, () => false);
}

// --- imperative API ---

async function postJson(url: string, body: unknown): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  let data: { ok?: boolean; error?: string } = {};
  try {
    data = (await res.json()) as { ok?: boolean; error?: string };
  } catch {
    /* empty body */
  }
  return { ok: res.ok && data.ok !== false, error: data.error };
}

export async function signUp(name: string, email: string, password: string): Promise<AuthResult> {
  const res = await postJson("/api/auth/signup", { name, email, password });
  if (!res.ok) return { ok: false, error: res.error ?? "Could not create account." };
  await refreshCurrentUser();
  return { ok: true };
}

export async function logIn(email: string, password: string): Promise<AuthResult> {
  const res = await postJson("/api/auth/login", { email, password });
  if (!res.ok) return { ok: false, error: res.error ?? "Incorrect email or password." };
  await refreshCurrentUser();
  return { ok: true };
}

export async function logOut(): Promise<void> {
  await postJson("/api/auth/logout", {});
  await refreshCurrentUser();
}

/** Patch the signed-in user (name, newsletter opt-in, plan) and refresh. */
export async function updateCurrentUser(patch: AccountPatch): Promise<void> {
  await postJson("/api/account", patch);
  await refreshCurrentUser();
}
