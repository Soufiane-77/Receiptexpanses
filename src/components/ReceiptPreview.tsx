import { forwardRef } from "react";
import type { Receipt } from "@/lib/types";
import { computeTotals } from "@/lib/calc";
import { getTemplate } from "@/templates/registry";

type Props = {
  receipt: Receipt;
  /** Override which template renders; defaults to receipt.templateId. */
  templateId?: string;
  /** When true, render a small "Made with ReceiptExpenses" watermark (non-subscribers). */
  watermark?: boolean;
};

/**
 * Renders a Receipt using the layout registered for its templateId.
 * Forwards a ref to the outer node so export (PNG/PDF) can capture it —
 * the watermark lives inside the ref so it is included in exports.
 */
const ReceiptPreview = forwardRef<HTMLDivElement, Props>(function ReceiptPreview(
  { receipt, templateId, watermark = false },
  ref,
) {
  const def = getTemplate(templateId ?? receipt.templateId);
  const totals = computeTotals(receipt);
  const { Component } = def;
  return (
    <div ref={ref} className="inline-block w-full bg-white">
      <Component receipt={receipt} totals={totals} />
      {watermark ? (
        <div className="bg-white pb-3 text-center text-[10px] tracking-wide text-slate-400">
          Made with ReceiptExpenses — subscribe to Pro to remove
        </div>
      ) : null}
    </div>
  );
});

export default ReceiptPreview;
