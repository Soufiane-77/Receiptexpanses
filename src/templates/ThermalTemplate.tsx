import { lineTotal } from "@/lib/calc";
import type { TemplateProps } from "./TemplateProps";
import { FauxBarcode, moneyFmt } from "./parts";

export default function ThermalTemplate({ receipt, totals }: TemplateProps) {
  const money = moneyFmt(receipt);
  return (
    <div className="mx-auto w-full max-w-[280px] bg-white p-4 font-mono text-xs text-black">
      <div className="text-center">
        {receipt.business.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={receipt.business.logoDataUrl}
            alt="logo"
            className="mx-auto mb-1 max-h-12 w-auto object-contain grayscale"
          />
        ) : null}
        <div className="text-sm font-bold uppercase">{receipt.business.name || "STORE NAME"}</div>
        {receipt.business.address ? (
          <div className="whitespace-pre-line">{receipt.business.address}</div>
        ) : null}
        {receipt.business.phone ? <div>{receipt.business.phone}</div> : null}
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div>
        <div>
          {receipt.meta.date} {receipt.meta.time}
        </div>
        <div>Receipt: {receipt.meta.receiptNo}</div>
        {receipt.meta.cashier ? <div>Cashier: {receipt.meta.cashier}</div> : null}
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="flex flex-col">
        {receipt.items.map((it) => (
          <div key={it.id}>
            <div className="truncate">{it.name || "—"}</div>
            <div className="flex justify-between">
              <span>
                {it.qty} x {money(it.unitPrice)}
              </span>
              <span>{money(lineTotal(it))}</span>
            </div>
          </div>
        ))}
        {receipt.items.length === 0 ? (
          <div className="text-center text-slate-500">No items yet</div>
        ) : null}
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between">
          <span>SUBTOTAL</span>
          <span>{money(totals.subtotal)}</span>
        </div>
        {receipt.showTax ? (
          <div className="flex justify-between">
            <span>TAX {receipt.taxRatePct}%</span>
            <span>{money(totals.tax)}</span>
          </div>
        ) : null}
        {receipt.showTip ? (
          <div className="flex justify-between">
            <span>TIP</span>
            <span>{money(totals.tip)}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>{money(totals.total)}</span>
        </div>
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div className="text-center uppercase">
        Paid by {receipt.paymentMethod}
        {receipt.paymentMethod === "card" && receipt.cardLast4 ? ` ****${receipt.cardLast4}` : ""}
      </div>

      {receipt.showBarcode ? (
        <div className="mt-3">
          <FauxBarcode value={receipt.extras.barcodeValue || receipt.meta.receiptNo} />
        </div>
      ) : null}

      {receipt.showFooter && receipt.footerNote ? (
        <div className="mt-3 text-center uppercase">{receipt.footerNote}</div>
      ) : null}
      <div className="mt-2 text-center">*** THANK YOU ***</div>
    </div>
  );
}
