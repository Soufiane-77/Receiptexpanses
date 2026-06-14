"use client";

import { useEffect, useState } from "react";
import type { Receipt } from "@/lib/types";
import { presetFor } from "@/lib/samples";
import { loadDraft } from "@/lib/storage";
import { loadSettings } from "@/lib/adminSettings";
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
    // If a template is explicitly requested, start fresh from its preset
    // (with admin defaults applied). Otherwise restore the saved draft.
    if (template) {
      setInitial(withDefaults(presetFor(template)));
      return;
    }
    setInitial(loadDraft() ?? withDefaults(presetFor(DEFAULT_TEMPLATE_ID)));
  }, [template]);

  if (!initial) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">Loading…</div>
    );
  }

  return <Editor initial={initial} />;
}
