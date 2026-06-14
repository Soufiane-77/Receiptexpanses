"use client";

import { TEMPLATES } from "@/templates/registry";

const SETTINGS_KEY = "receiptforge:settings";
const AUTH_KEY = "receiptforge:admin-auth";

export type AdminDefaults = {
  currency: string;
  taxRatePct: number;
  accentColor: string;
  footerNote: string;
  business: { name: string; address: string; phone: string };
};

/**
 * Payment configuration. IMPORTANT: only the *publishable* key is stored here.
 * Stripe's publishable key (pk_...) is designed to be exposed in the browser.
 * The SECRET key (sk_...) must NEVER be stored client-side or in a soft-gated
 * admin panel — it belongs in server environment variables. There is no field
 * for it on purpose.
 */
export type PaymentSettings = {
  provider: "none" | "stripe";
  publishableKey: string;
  proPriceId: string;
};

export type AdminSettings = {
  /** Template ids shown on the landing page (order preserved). */
  enabledTemplates: string[];
  defaults: AdminDefaults;
  payments: PaymentSettings;
  /** Soft gate password (client-side only; this is not real security). */
  password: string;
};

export function defaultSettings(): AdminSettings {
  return {
    enabledTemplates: TEMPLATES.map((t) => t.id),
    defaults: {
      currency: "USD",
      taxRatePct: 8.25,
      accentColor: "#4f46e5",
      footerNote: "Thank you for your purchase!",
      business: { name: "", address: "", phone: "" },
    },
    payments: { provider: "none", publishableKey: "", proPriceId: "" },
    password: "admin",
  };
}

export function loadSettings(): AdminSettings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<AdminSettings>;
    const base = defaultSettings();
    const loadedIds = parsed.enabledTemplates ?? base.enabledTemplates;
    const allIds = [...loadedIds];
    base.enabledTemplates.forEach((id) => {
      if (!allIds.includes(id)) {
        allIds.push(id);
      }
    });
    return {
      enabledTemplates: allIds,
      defaults: { ...base.defaults, ...parsed.defaults },
      payments: { ...base.payments, ...parsed.payments },
      password: parsed.password ?? base.password,
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s: AdminSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

/** Enabled templates, in the saved order, resolved to full definitions. */
export function enabledTemplateDefs() {
  const ids = loadSettings().enabledTemplates;
  return ids
    .map((id) => TEMPLATES.find((t) => t.id === id))
    .filter((t): t is (typeof TEMPLATES)[number] => Boolean(t));
}

// --- Soft auth (session-scoped) ---

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(AUTH_KEY) === "1";
}

export function tryLogin(password: string): boolean {
  if (password === loadSettings().password) {
    window.sessionStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(AUTH_KEY);
}
