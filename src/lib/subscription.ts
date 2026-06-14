"use client";

import { updateCurrentUser, useCurrentUser, type Plan } from "./auth";

export type PlanDef = {
  id: Plan;
  name: string;
  priceLabel: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
};

export const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    tagline: "Everything you need to make a receipt.",
    features: [
      "All 6 receipt templates",
      "Live preview & print",
      "PNG & PDF export",
      "Save up to 3 receipts",
      "Small ReceiptExpenses watermark on exports",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "$6/mo",
    tagline: "For freelancers and small businesses.",
    highlighted: true,
    features: [
      "Everything in Free",
      "No watermark on exports",
      "Unlimited saved receipts",
      "Priority access to new templates",
      "Support future development",
    ],
  },
];

/** Free accounts (and signed-out users) can save at most this many receipts. */
export const FREE_SAVE_LIMIT = 3;

/** Reactive: is the current user on the Pro plan? */
export function useIsPro(): boolean {
  const user = useCurrentUser();
  return user?.plan === "pro";
}

/** Simulate a successful checkout — upgrade the current user to Pro. */
export function subscribePro(): void {
  updateCurrentUser({ plan: "pro", proSince: new Date().toISOString() });
}

/** Downgrade back to Free. */
export function cancelPro(): void {
  updateCurrentUser({ plan: "free", proSince: undefined });
}

// --- Blog newsletter ---

const NEWSLETTER_KEY = "receiptforge:newsletter";

function readNewsletter(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return (JSON.parse(window.localStorage.getItem(NEWSLETTER_KEY) ?? "[]") as string[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * Subscribe an email to the blog newsletter. If the email belongs to the
 * signed-in user, also flag their account as subscribed. Returns false when the
 * email is already on the list.
 */
export function subscribeNewsletter(email: string, isCurrentUser: boolean): boolean {
  const normalized = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) return false;
  const list = readNewsletter();
  const already = list.includes(normalized);
  if (!already) {
    window.localStorage.setItem(NEWSLETTER_KEY, JSON.stringify([...list, normalized]));
  }
  if (isCurrentUser) updateCurrentUser({ blogSubscribed: true });
  return !already;
}
