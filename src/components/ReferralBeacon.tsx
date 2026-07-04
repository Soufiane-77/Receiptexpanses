"use client";

import { useEffect } from "react";

/**
 * Fires a single cookieless referral beacon per browser session to /api/track,
 * so AI-answer-engine referrals (ChatGPT, Claude, Perplexity, Gemini, Copilot…)
 * are visible in first-party analytics. No cookies, no PII, no third-party tag —
 * it sends only the referrer, landing path and query string, once, and never
 * blocks rendering. Same-origin referrers (internal navigation) are skipped.
 */
export default function ReferralBeacon() {
  useEffect(() => {
    try {
      const KEY = "re_ref_sent";
      if (sessionStorage.getItem(KEY)) return;

      const referrer = document.referrer || "";
      // Skip internal navigation — only record entries from outside the site.
      if (referrer) {
        try {
          if (new URL(referrer).hostname === location.hostname) {
            sessionStorage.setItem(KEY, "1");
            return;
          }
        } catch {
          /* malformed referrer — treat as external */
        }
      }

      sessionStorage.setItem(KEY, "1");
      const payload = JSON.stringify({
        referrer,
        path: location.pathname,
        search: location.search,
      });

      const sent =
        typeof navigator.sendBeacon === "function" &&
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));

      if (!sent) {
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* analytics must never break the page */
    }
  }, []);

  return null;
}
