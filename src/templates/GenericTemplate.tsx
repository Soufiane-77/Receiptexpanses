import { lineTotal } from "@/lib/calc";
import type { TemplateProps } from "./TemplateProps";
import { BusinessHeader, Divider, PaymentBlock, TotalRow, fontSizeClass, moneyFmt } from "./parts";

export default function GenericTemplate({ receipt, totals }: TemplateProps) {
  const money = moneyFmt(receipt);
  return (
    <div className={`mx-auto w-full max-w-sm bg-white p-6 text-slate-800 ${fontSizeClass(receipt)}`}>
      <div
        className="mb-3 border-b-4 pb-3"
        style={{ borderColor: receipt.accentColor }}
      >
        <BusinessHeader receipt={receipt} />
      </div>

      <div className="mb-2 flex flex-col gap-0.5 text-slate-600">
        <div className="flex justify-between">
          <span>Receipt #</span>
          <span>{receipt.meta.receiptNo}</span>
        </div>
        <div className="flex justify-between">
          <span>Date</span>
          <span>
            {receipt.meta.date} {receipt.meta.time}
          </span>
        </div>
        {receipt.meta.cashier ? (
          <div className="flex justify-between">
            <span>Cashier</span>
            <span>{receipt.meta.cashier}</span>
          </div>
        ) : null}
        {receipt.extras.nikeOrderNo ? (
          <div className="flex justify-between">
            <span>Order Number</span>
            <span>{receipt.extras.nikeOrderNo}</span>
          </div>
        ) : null}
        {receipt.extras.adidasOrderNo ? (
          <div className="flex justify-between">
            <span>Order Number</span>
            <span>{receipt.extras.adidasOrderNo}</span>
          </div>
        ) : null}
        {receipt.extras.appleOrderNo ? (
          <div className="flex justify-between">
            <span>Order Number</span>
            <span>{receipt.extras.appleOrderNo}</span>
          </div>
        ) : null}
        {receipt.extras.jordanOrderNo ? (
          <div className="flex justify-between">
            <span>Order Number</span>
            <span>{receipt.extras.jordanOrderNo}</span>
          </div>
        ) : null}
      </div>

      <Divider />

      <table className="w-full">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="font-medium">Item</th>
            <th className="w-10 text-center font-medium">Qty</th>
            <th className="w-20 text-right font-medium">Price</th>
            <th className="w-20 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((it) => (
            <tr key={it.id} className="align-top">
              <td className="py-0.5 pr-2">{it.name || "—"}</td>
              <td className="py-0.5 text-center">{it.qty}</td>
              <td className="py-0.5 text-right">{money(it.unitPrice)}</td>
              <td className="py-0.5 text-right">{money(lineTotal(it))}</td>
            </tr>
          ))}
          {receipt.items.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-2 text-center text-slate-400">
                No items yet
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

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

      <Divider />

      <PaymentBlock receipt={receipt} />

      {receipt.showFooter && receipt.footerNote ? (
        <div className="mt-4 text-center text-slate-500">{receipt.footerNote}</div>
      ) : null}
    </div>
  );
}
