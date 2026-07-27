"use client";

import type { ReceiptAction } from "./server/receiptEvents";

/**
 * Fire-and-forget receipt-generation beacon (metadata only: which template and
 * which action). Never sends receipt content — the server attributes the event
 * to the signed-in user from the session cookie. Failures are ignored so an
 * export is never blocked by analytics.
 */
export function trackReceipt(templateId: string, action: ReceiptAction): void {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/track/receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      keepalive: true,
      body: JSON.stringify({ templateId, action }),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

export type { ReceiptAction };
