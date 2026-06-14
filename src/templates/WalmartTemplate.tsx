import { lineTotal } from "@/lib/calc";
import type { TemplateProps } from "./TemplateProps";
import { FauxBarcode, moneyFmt } from "./parts";

export default function WalmartTemplate({ receipt, totals }: TemplateProps) {
  const money = moneyFmt(receipt);

  const storeNo = receipt.extras.walmartStoreNo || "1396";
  const terminalNo = receipt.extras.walmartTerminalNo || "04";
  const transactionNo = receipt.extras.walmartTransactionNo || "9821";
  const tcNo = receipt.extras.walmartTcNo || "4920 8371 9028 3847 1827";
  const cashierNo = receipt.meta.cashier || "382";

  return (
    <div className="mx-auto w-full max-w-[280px] bg-white p-4 font-mono text-[10px] leading-tight text-black border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="text-center flex flex-col items-center">
        {receipt.business.logoDataUrl ? (
          <img
            src={receipt.business.logoDataUrl}
            alt="logo"
            className="mx-auto mb-1 max-h-12 w-auto object-contain grayscale"
          />
        ) : (
          <div className="flex flex-col items-center mb-1">
            {/* Walmart-like sunburst/spark icon */}
            <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0h1v8h-1zm0 16h1v8h-1zm-6-2h8v1H6zm-4.24-6.42 5.66 5.66-.71.71-5.66-5.66zm15.56 15.56 5.66 5.66-.71.71-5.66-5.66zM2.05 17.66l5.66-5.66.71.71-5.66 5.66zm15.56-15.56 5.66-5.66.71.71-5.66 5.66z" />
            </svg>
            <div className="text-xs font-bold uppercase tracking-wider">WALMART</div>
          </div>
        )}
        <div className="uppercase">
          {receipt.business.name && receipt.business.name.toUpperCase() !== "WALMART" ? receipt.business.name : "Supercenter"}
        </div>
        {receipt.business.address ? (
          <div className="whitespace-pre-line uppercase text-[9px]">{receipt.business.address}</div>
        ) : (
          <div className="uppercase text-[9px]">
            120 Commerce Dr, Springfield<br />
            Phone: (555) 304-2000
          </div>
        )}
      </div>

      <div className="my-1 border-t border-dashed border-black" />

      {/* Transaction Details */}
      <div className="flex flex-col text-[9px]">
        <div className="flex justify-between">
          <span>ST# {storeNo}</span>
          <span>OP# {cashierNo}</span>
          <span>TE# {terminalNo}</span>
          <span>TR# {transactionNo}</span>
        </div>
        <div className="flex justify-between mt-0.5">
          <span>{receipt.meta.date}</span>
          <span>{receipt.meta.time}</span>
        </div>
      </div>

      <div className="my-1 border-t border-dashed border-black" />

      {/* Line Items */}
      <div className="flex flex-col">
        {receipt.items.map((it) => (
          <div key={it.id} className="mb-0.5">
            <div className="flex justify-between">
              <span className="truncate uppercase max-w-[170px]">{it.name || "ITEM"}</span>
              <span>
                {money(lineTotal(it))} {receipt.showTax ? "T" : "N"}
              </span>
            </div>
            {it.qty > 1 ? (
              <div className="text-[9px] pl-2">
                {it.qty} @ {money(it.unitPrice)}
              </div>
            ) : null}
          </div>
        ))}
        {receipt.items.length === 0 ? (
          <div className="text-center text-slate-500 py-1">NO ITEMS YET</div>
        ) : null}
      </div>

      <div className="my-1 border-t border-dashed border-black" />

      {/* Totals */}
      <div className="flex flex-col gap-0.5 text-[10px]">
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
        {receipt.showTip && totals.tip > 0 ? (
          <div className="flex justify-between">
            <span>TIP / DONATION</span>
            <span>{money(totals.tip)}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-bold text-xs mt-0.5">
          <span>TOTAL</span>
          <span>{money(totals.total)}</span>
        </div>
      </div>

      <div className="my-1 border-t border-dashed border-black" />

      {/* Payment Block */}
      <div className="text-center uppercase text-[9px] mb-2">
        PAID BY {receipt.paymentMethod}
        {receipt.paymentMethod === "card" && receipt.cardLast4 ? ` ****${receipt.cardLast4}` : ""}
      </div>

      {/* Walmart TC & Barcode */}
      <div className="text-center mt-2 flex flex-col items-center">
        <div className="text-[9px] tracking-wide mb-1">
          TC# {tcNo}
        </div>
        {receipt.showBarcode ? (
          <FauxBarcode value={tcNo.replace(/\s+/g, "")} />
        ) : null}
      </div>

      {receipt.showFooter && receipt.footerNote ? (
        <div className="mt-2 text-center uppercase text-[8px] leading-tight">{receipt.footerNote}</div>
      ) : (
        <div className="mt-2 text-center uppercase text-[8px] leading-tight">
          ST# {storeNo} OP# {cashierNo} TE# {terminalNo} TR# {transactionNo} <br />
          THANK YOU FOR SHOPPING WITH US!<br />
          *** WALMART.COM ***
        </div>
      )}
    </div>
  );
}
