"use client";

import { useSyncExternalStore } from "react";
import { newId } from "./id";

/**
 * Client-side account simulation. Accounts + sessions live in the browser's
 * storage — there is no backend and this is NOT real security. It exists to
 * drive the dashboard / subscription UX and can be swapped for a real auth
 * provider later without touching the components that use these hooks.
 */

export type Plan = "free" | "pro";

export type User = {
  id: string;
  name: string;
  email: string;
  passHash: string;
  plan: Plan;
  proSince?: string;
  blogSubscribed: boolean;
  createdAt: string;
};

export type PublicUser = Omit<User, "passHash">;

const USERS_KEY = "receiptforge:users";
const SESSION_KEY = "receiptforge:session";

// --- tiny non-cryptographic hash (demo only) ---
function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

function readUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    return (JSON.parse(window.localStorage.getItem(USERS_KEY) ?? "[]") as User[]) ?? [];
  } catch {
    return [];
  }
}

function writeUsers(users: User[]): void {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublic(u: User): PublicUser {
  const { passHash: _passHash, ...pub } = u;
  return pub;
}

// --- external store wiring (so hooks re-render on change) ---
const listeners = new Set<() => void>();
let snapshot: PublicUser | null = null;
let initialized = false;

function compute(): PublicUser | null {
  if (typeof window === "undefined") return null;
  const sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId) return null;
  const user = readUsers().find((u) => u.id === sessionId);
  return user ? toPublic(user) : null;
}

function refresh(): void {
  snapshot = compute();
}

function emit(): void {
  refresh();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  if (!initialized) {
    refresh();
    initialized = true;
    if (typeof window !== "undefined") {
      // Sync across tabs.
      window.addEventListener("storage", emit);
    }
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): PublicUser | null {
  if (!initialized) {
    refresh();
    initialized = true;
  }
  return snapshot;
}

function getServerSnapshot(): PublicUser | null {
  return null;
}

/** Reactive current-user hook. Returns null when signed out. */
export function useCurrentUser(): PublicUser | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// --- imperative API ---

export type AuthResult = { ok: true } | { ok: false; error: string };

export function signUp(name: string, email: string, password: string): AuthResult {
  const normalized = email.trim().toLowerCase();
  if (!name.trim()) return { ok: false, error: "Please enter your name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized))
    return { ok: false, error: "Enter a valid email address." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  const users = readUsers();
  if (users.some((u) => u.email === normalized))
    return { ok: false, error: "An account with that email already exists." };

  const user: User = {
    id: newId(),
    name: name.trim(),
    email: normalized,
    passHash: hash(password),
    plan: "free",
    blogSubscribed: false,
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  window.localStorage.setItem(SESSION_KEY, user.id);
  emit();
  return { ok: true };
}

export function logIn(email: string, password: string): AuthResult {
  const normalized = email.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === normalized);
  if (!user || user.passHash !== hash(password))
    return { ok: false, error: "Incorrect email or password." };
  window.localStorage.setItem(SESSION_KEY, user.id);
  emit();
  return { ok: true };
}

export function logOut(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  emit();
}

/** Patch the currently signed-in user and notify subscribers. */
export function updateCurrentUser(patch: Partial<Omit<User, "id" | "passHash">>): void {
  const sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId) return;
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === sessionId);
  if (idx < 0) return;
  users[idx] = { ...users[idx]!, ...patch };
  writeUsers(users);
  emit();
}
