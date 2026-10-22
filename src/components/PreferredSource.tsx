import Script from "next/script";
import { SITE_URL } from "@/lib/seo";
import { PREFERRED_SOURCE_ENABLED } from "@/lib/features";

/**
 * Google "Preferred Sources": lets a reader pin this site so it surfaces more
 * often for them in Top Stories, AI Mode and AI Overviews.
 * https://developers.google.com/search/docs/appearance/preferred-sources
 */

const SITE_HOST = new URL(SITE_URL).host;

/** Google's deeplink straight to this site's entry in the source-preferences tool. */
export const PREFERRED_SOURCE_URL = `https://www.google.com/preferences/source?q=${SITE_HOST}`;

/**
 * Google's own rendered button: Google-styled and localized to the reader.
 *
 * Mount this ONLY somewhere present in the first server-rendered HTML of every
 * page, i.e. the persistent layout. publisher.js scans for
 * `[google-add-preferred-source-btn]` once, at startup. (The bundle does contain
 * a MutationObserver, but it belongs to its Material components, not the
 * scanner.) A button rendered later by a client-side navigation would never be
 * initialized and would stay an empty box. Use <PreferredSourceLink> elsewhere.
 */
export function PreferredSourceButton({ theme = "light" }: { theme?: "light" | "dark" }) {
  if (!PREFERRED_SOURCE_ENABLED) return null;
  return (
    <>
      {/* The library injects the button into this div's shadow root after
          hydration; suppressHydrationWarning covers the rare case it wins the
          race. min-h reserves the rendered button's 40px height up front, so
          nothing jumps when the script lands on short pages where the footer is
          already in view. */}
      <div
        google-add-preferred-source-btn=""
        data-theme={theme}
        className="min-h-[40px]"
        suppressHydrationWarning
      />
      {/* 38 KB gzipped and irrelevant to first paint, so it waits for idle. */}
      <Script
        id="google-preferred-source"
        src="https://news.google.com/swg/js/v1/publisher.js"
        strategy="lazyOnload"
      />
    </>
  );
}

/**
 * End-of-article prompt using the plain deeplink. No script, so it works on
 * any page however the reader arrived there, including client-side navigation.
 */
export function PreferredSourceLink() {
  if (!PREFERRED_SOURCE_ENABLED) return null;
  return (
    <aside className="mt-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-slate-900">Want more guides like this in Google?</p>
        <p className="mt-1 text-sm text-slate-600">
          Add ReceiptExpenses as a preferred source and our articles show up more often in your
          Top Stories and AI Overviews.
        </p>
      </div>
      <a
        href={PREFERRED_SOURCE_URL}
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <StarIcon />
        Add on Google
      </a>
    </aside>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-amber-400">
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
    </svg>
  );
}
