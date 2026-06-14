"use client";

import type { Receipt } from "./types";

const DRAFT_KEY = "receiptforge:draft";
const SAVED_KEY = "receiptforge:saved";

export type SavedReceipt = {
  id: string;
  name: string;
  savedAt: string; // ISO timestamp
  receipt: Receipt;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** The in-progress draft, restored on refresh. */
export function loadDraft(): Receipt | null {
  if (typeof window === "undefined") return null;
  return safeParse<Receipt>(window.localStorage.getItem(DRAFT_KEY));
}

export function saveDraft(receipt: Receipt): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(receipt));
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

/** Named, explicitly-saved receipts (managed in the admin panel). */
export function loadSaved(): SavedReceipt[] {
  if (typeof window === "undefined") return [];
  return safeParse<SavedReceipt[]>(window.localStorage.getItem(SAVED_KEY)) ?? [];
}

export function persistSaved(list: SavedReceipt[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function addSaved(entry: SavedReceipt): SavedReceipt[] {
  const list = loadSaved();
  const next = [entry, ...list];
  persistSaved(next);
  return next;
}

export function removeSaved(id: string): SavedReceipt[] {
  const next = loadSaved().filter((s) => s.id !== id);
  persistSaved(next);
  return next;
}
