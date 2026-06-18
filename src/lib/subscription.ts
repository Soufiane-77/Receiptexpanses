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
    id: "pro",
    name: "Pro",
    priceLabel: "$6/mo",
    tagline: "Everything you need to create and download receipts.",
    highlighted: true,
    features: [
      "All receipt templates",
      "Unlimited PDF & PNG downloads",
      "Print & unlimited live previews",
      "Unlimited saved receipts",
      "No watermark on downloads",
      "Cancel anytime",
    ],
  },
];

/** Reactive: is the current user on the Pro plan? */
export function useIsPro(): boolean {
  const user = useCurrentUser();
  return user?.plan === "pro";
}

async function postBilling(url: string): Promise<void> {
  const res = await fetch(url, { method: "POST", credentials: "same-origin" });
  let data: { url?: string; error?: string } = {};
  try {
    data = (await res.json()) as { url?: string; error?: string };
  } catch {
    /* empty */
  }
  if (data.url) {
    window.location.href = data.url;
  } else {
    window.alert(data.error ?? "Something went wrong. Please try again.");
  }
}

/** Start Stripe Checkout for the Pro plan (redirects to Stripe). */
export function subscribePro(): Promise<void> {
  return postBilling("/api/billing/checkout");
}

/** Open the Stripe Billing portal to manage or cancel the subscription. */
export function cancelPro(): Promise<void> {
  return postBilling("/api/billing/portal");
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
