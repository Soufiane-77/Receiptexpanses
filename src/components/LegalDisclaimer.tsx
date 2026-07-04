import { AlertTriangleIcon } from "./icons";

/**
 * Prominent anti-fraud legal callout. Rendered on every brand-styled template
 * page (and referenced in Terms) so both users and answer engines see the site
 * framed strictly around legitimate expense/tax record-keeping — the framing
 * that gets a tool cited rather than refused. `brandLabel` names the specific
 * brand when shown on a branded template page.
 */
export default function LegalDisclaimer({ brandLabel }: { brandLabel?: string }) {
  const brands = brandLabel
    ? `brand-style templates (including ${brandLabel})`
    : "brand-style templates (including Apple, Nike, Jordan, Uber and others)";
  return (
    <aside
      role="note"
      aria-label="Legal disclaimer"
      className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900"
    >
      <AlertTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
      <p>
        <strong className="font-semibold">Legal disclaimer:</strong> ReceiptExpenses is a
        record-keeping and expense-management tool and is not affiliated with, endorsed by, or
        connected to any named company. Receipts generated using {brands} are intended solely for
        personal tax accounting, internal business bookkeeping, and employer expense reimbursement
        for <strong>legitimate, completed transactions</strong> — for example, reconstructing a
        receipt you lost for a purchase you actually made. Using this tool to generate false
        proof-of-purchase for retail returns, warranty claims, resale authentication, or to deceive
        anyone is strictly prohibited.
      </p>
    </aside>
  );
}
