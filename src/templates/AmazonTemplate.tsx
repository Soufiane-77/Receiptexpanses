import { lineTotal } from "@/lib/calc";
import type { TemplateProps } from "./TemplateProps";
import { fontSizeClass, moneyFmt } from "./parts";

export default function AmazonTemplate({ receipt, totals }: TemplateProps) {
  const money = moneyFmt(receipt);
  const accent = receipt.accentColor || "#FF9900";

  const orderNo = receipt.extras.amazonOrderNo || "114-8293740-1928374";
  const shipmentNo = receipt.extras.amazonShipmentNo || "9876543210";

  return (
    <div className={`mx-auto w-full max-w-2xl bg-white p-8 text-slate-800 border border-slate-200 shadow-sm ${fontSizeClass(receipt)}`}>
      {/* Top Header */}
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          {receipt.business.logoDataUrl ? (
            <img
              src={receipt.business.logoDataUrl}
              alt="logo"
              className="max-h-12 w-auto object-contain"
            />
          ) : (
            <div className="flex flex-col select-none">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 flex flex-col items-start leading-none">
                <span>
                  {receipt.business.name && receipt.business.name.toLowerCase().includes("amazon")
                    ? "amazon"
                    : (receipt.business.name || "amazon")}
                  {!receipt.business.name || !receipt.business.name.toLowerCase().endsWith(".com")
                    ? ".com"
                    : ""}
                </span>
                <svg className="h-2 w-12 text-[#FF9900] mt-0.5" viewBox="0 0 40 8" fill="currentColor">
                  <path d="M1 2 Q20 8 39 2 Q20 5 1 2" />
                </svg>
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest pl-1 mt-1">invoice</span>
            </div>
          )}
        </div>
        <div className="text-right text-xs text-slate-500">
          <div className="font-bold text-slate-700">Order ID: {orderNo}</div>
          <div>Order Date: {receipt.meta.date}</div>
          <div>Shipment ID: {shipmentNo}</div>
        </div>
      </div>

      {/* Addresses info */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="font-bold text-slate-700 uppercase tracking-wider mb-1">Billing Address</div>
          <div className="text-slate-600 whitespace-pre-line">
            {receipt.business.address || "John Doe\n123 Maple Street\nSpringfield, IL 62701"}
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="font-bold text-slate-700 uppercase tracking-wider mb-1">Shipping Address</div>
          <div className="text-slate-600 whitespace-pre-line">
            {receipt.business.address || "John Doe\n123 Maple Street\nSpringfield, IL 62701"}
          </div>
        </div>
      </div>

      {/* Items Ordered Table */}
      <div className="mb-6">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider border-y border-slate-200">
              <th className="py-2 px-3 font-semibold">Items Ordered</th>
              <th className="py-2 px-3 font-semibold w-16 text-center">Qty</th>
              <th className="py-2 px-3 font-semibold w-24 text-right">Unit Price</th>
              <th className="py-2 px-3 font-semibold w-24 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100 align-top">
                <td className="py-3 px-3 font-medium text-slate-900">{it.name || "Amazon Product"}</td>
                <td className="py-3 px-3 text-center">{it.qty}</td>
                <td className="py-3 px-3 text-right">{money(it.unitPrice)}</td>
                <td className="py-3 px-3 text-right font-medium">{money(lineTotal(it))}</td>
              </tr>
            ))}
            {receipt.items.length === 0 ? (
              <tr className="border-b border-slate-100">
                <td colSpan={4} className="py-4 px-3 text-center text-slate-400">
                  No items in this order
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Summary and Payment */}
      <div className="grid grid-cols-2 gap-6 text-xs">
        <div>
          <div className="font-bold text-slate-700 uppercase tracking-wider mb-2">Payment Details</div>
          <div className="text-slate-600">
            <div>
              Payment Method:{" "}
              <strong>
                {receipt.paymentMethod === "card"
                  ? `Card ending in ${receipt.cardLast4 || "••••"}`
                  : receipt.paymentMethod === "cash"
                  ? "Cash Payment"
                  : "Alternative Payment"}
              </strong>
            </div>
            <div className="mt-4 text-slate-400 leading-tight">
              Seller: Amazon.com Services LLC<br />
              Thank you for buying on Amazon.
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-slate-600">Item(s) Subtotal:</span>
            <span className="font-medium text-slate-900">{money(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Shipping &amp; Handling:</span>
            <span className="font-medium text-slate-900">{money(0)}</span>
          </div>
          {receipt.showTax ? (
            <div className="flex justify-between">
              <span className="text-slate-600">Estimated Tax:</span>
              <span className="font-medium text-slate-900">{money(totals.tax)}</span>
            </div>
          ) : null}
          {receipt.showTip && totals.tip > 0 ? (
            <div className="flex justify-between">
              <span className="text-slate-600">Tip / Donation:</span>
              <span className="font-medium text-slate-900">{money(totals.tip)}</span>
            </div>
          ) : null}
          <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-slate-950">
            <span>Grand Total:</span>
            <span style={{ color: accent }}>{money(totals.total)}</span>
          </div>
        </div>
      </div>

      {receipt.showFooter && receipt.footerNote ? (
        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
          {receipt.footerNote}
        </div>
      ) : null}
    </div>
  );
}
