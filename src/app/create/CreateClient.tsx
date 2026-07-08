"use client";

import { useEffect, useState } from "react";
import type { Receipt } from "@/lib/types";
import { presetFor } from "@/lib/samples";
import { loadDraft } from "@/lib/storage";
import { loadSettings } from "@/lib/adminSettings";
import { applyTemplateCustomization } from "@/lib/templateCustomize";
import { localeForCurrency } from "@/lib/currencies";
import { DEFAULT_TEMPLATE_ID } from "@/templates/registry";
import Editor from "@/components/Editor";

/** Overlay admin-configured defaults onto a fresh preset. */
function withDefaults(receipt: Receipt): Receipt {
  const { defaults } = loadSettings();
  return {
    ...receipt,
    currency: defaults.currency || receipt.currency,
    locale: localeForCurrency(defaults.currency || receipt.currency),
    taxRatePct: defaults.taxRatePct,
    accentColor: defaults.accentColor || receipt.accentColor,
    footerNote: defaults.footerNote || receipt.footerNote,
    business: {
      ...receipt.business,
      name: defaults.business.name || receipt.business.name,
      address: defaults.business.address || receipt.business.address,
      phone: defaults.business.phone || receipt.business.phone,
    },
  };
}

export default function CreateClient({ template }: { template?: string }) {
  const [initial, setInitial] = useState<Receipt | null>(null);

  useEffect(() => {
    // Prefer the path param (/create/{id}). For back-compat, still honour a
    // legacy `?template=` query — but rewrite the URL to the clean path so the
    // old query-string URL stops existing.
    let tpl = template ?? null;
    if (!tpl) {
      const q = new URLSearchParams(window.location.search).get("template");
      if (q) {
        tpl = q;
        window.history.replaceState(null, "", `/create/${q}`);
      }
    }
    // If a template is explicitly requested, start fresh from its preset
    // (with admin defaults applied). Otherwise restore the saved draft.
    if (tpl) {
      setInitial(applyTemplateCustomization(withDefaults(presetFor(tpl)), tpl));
      return;
    }
    setInitial(
      loadDraft() ??
        applyTemplateCustomization(
          withDefaults(presetFor(DEFAULT_TEMPLATE_ID)),
          DEFAULT_TEMPLATE_ID,
        ),
    );
  }, [template]);

  if (!initial) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">Loading…</div>
    );
  }

  return <Editor initial={initial} />;
}
