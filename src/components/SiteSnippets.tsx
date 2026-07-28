"use client";

import { useEffect } from "react";

/**
 * Injects the admin-configured custom code (analytics tags, pixels, custom
 * styles) into the live page.
 *
 * Runs on the client so every marketing page stays statically generated —
 * reading the snippets server-side in the root layout would force all pages to
 * render per-request and undo the static/SEO work.
 *
 * Note for the admin UI: JS-injected <meta> tags are NOT reliable for
 * search-engine site verification (crawlers read the served HTML). Use the
 * HTML-file or DNS verification method for that.
 */
export default function SiteSnippets() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/snippets", { credentials: "omit" });
        if (!res.ok) return;
        const { headHtml, bodyHtml } = (await res.json()) as {
          headHtml?: string;
          bodyHtml?: string;
        };
        if (cancelled) return;
        if (headHtml) inject(headHtml, document.head, "head");
        if (bodyHtml) inject(bodyHtml, document.body, "body");
      } catch {
        /* never break the page for a snippet */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

/**
 * Parse an HTML string and append its nodes to `target`.
 *
 * <script> elements created by the HTML parser are inert, so they are rebuilt
 * as fresh elements (copying attributes + inline code) to make them execute —
 * this is what makes GA/GTM/pixel snippets actually run.
 */
function inject(html: string, target: HTMLElement, key: string): void {
  const marker = `data-snippet-${key}`;
  if (document.querySelector(`[${marker}]`)) return; // already injected

  const tpl = document.createElement("template");
  tpl.innerHTML = html;

  Array.from(tpl.content.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "SCRIPT") {
      const src = node as HTMLScriptElement;
      const s = document.createElement("script");
      for (const attr of Array.from(src.attributes)) s.setAttribute(attr.name, attr.value);
      if (src.textContent) s.textContent = src.textContent;
      s.setAttribute(marker, "");
      target.appendChild(s);
    } else {
      if (node.nodeType === Node.ELEMENT_NODE) (node as Element).setAttribute(marker, "");
      target.appendChild(node.cloneNode(true));
    }
  });
}
