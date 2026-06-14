import { lineTotal } from "@/lib/calc";
import type { TemplateProps } from "./TemplateProps";
import { BusinessHeader, Divider, TotalRow, fontSizeClass, moneyFmt } from "./parts";

export default function RestaurantTemplate({ receipt, totals }: TemplateProps) {
  const money = moneyFmt(receipt);
  const { extras } = receipt;
  return (
    <div className={`mx-auto w-full max-w-sm bg-white p-6 text-slate-800 ${fontSizeClass(receipt)}`}>
      <BusinessHeader receipt={receipt} />

      <div className="mt-3 flex justify-between text-slate-600">
        <span>{receipt.meta.date}</span>
        <span>{receipt.meta.time}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        {extras.serverName ? <span>Server: {extras.serverName}</span> : <span />}
        {extras.tableNo ? <span>Table {extras.tableNo}</span> : <span />}
      </div>

      <Divider />

      <div className="flex flex-col gap-0.5">
        {receipt.items.map((it) => (
          <div key={it.id} className="flex justify-between">
            <span>
              {it.qty}× {it.name || "—"}
            </span>
            <span>{money(lineTotal(it))}</span>
          </div>
        ))}
        {receipt.items.length === 0 ? (
          <div className="py-2 text-center text-slate-400">No items yet</div>
        ) : null}
      </div>

      <Divider />

      <div className="flex flex-col gap-0.5">
        <TotalRow label="Subtotal" value={money(totals.subtotal)} />
        {receipt.showTax ? (
          <TotalRow label={`Tax (${receipt.taxRatePct}%)`} value={money(totals.tax)} />
        ) : null}
        {receipt.showTip ? <TotalRow label="Tip" value={money(totals.tip)} /> : null}
        <div className="mt-1 border-t border-slate-300 pt-1">
          <TotalRow label="Total" value={money(totals.total)} strong />
        </div>
      </div>

      {receipt.showTip ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <span className="text-slate-500">Additional Tip</span>
            <span className="w-24 border-b border-slate-400" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-slate-500">Total</span>
            <span className="w-24 border-b border-slate-400" />
          </div>
        </div>
      ) : null}

      {receipt.showSignatureLine ? (
        <div className="mt-6">
          <div className="border-t border-slate-500" />
          <div className="mt-1 text-center text-xs text-slate-500">Signature</div>
        </div>
      ) : null}

      {receipt.showFooter && receipt.footerNote ? (
        <div className="mt-4 text-center text-slate-500">{receipt.footerNote}</div>
      ) : null}
    </div>
  );
}
