import { lineTotal } from "@/lib/calc";
import type { TemplateProps } from "./TemplateProps";
import { moneyFmt } from "./parts";
import { StarbucksLogoIcon } from "@/components/icons";

export default function StarbucksTemplate({ receipt, totals }: TemplateProps) {
  const money = moneyFmt(receipt);
  const accentColor = receipt.accentColor || "#00704A";

  const checkNo = receipt.extras.starbucksCheckNo || "19385";
  const starsEarned = receipt.extras.starbucksStarsEarned || "12";
  const cashierName = receipt.meta.cashier || "Sarah";

  return (
    <div className="mx-auto w-full max-w-[280px] bg-white p-5 font-mono text-[10px] leading-tight text-slate-800 border border-slate-100 shadow-sm">
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
            <StarbucksLogoIcon className="h-10 w-10 mb-1" style={{ color: accentColor }} />
            <div className="text-xs font-bold uppercase tracking-wider">
              {receipt.business.name || "STARBUCKS"}
            </div>
          </div>
        )}
        {receipt.business.address ? (
          <div className="whitespace-pre-line text-[9px] uppercase mt-1">{receipt.business.address}</div>
        ) : (
          <div className="text-[9px] uppercase mt-1">
            Store #10398<br />
            450 Lexington Ave, New York, NY<br />
            Phone: (212) 555-9018
          </div>
        )}
      </div>

      <div className="my-2 border-t border-dashed border-slate-400" />

      {/* Ticket Details */}
      <div className="flex flex-col text-[9px]">
        <div className="flex justify-between">
          <span>CHK {checkNo}</span>
          <span>CASHIER: {cashierName}</span>
        </div>
        <div className="flex justify-between mt-0.5">
          <span>{receipt.meta.date}</span>
          <span>{receipt.meta.time}</span>
        </div>
      </div>

      <div className="my-2 border-t border-dashed border-slate-400" />

      {/* Items */}
      <div className="flex flex-col">
        {receipt.items.map((it) => (
          <div key={it.id} className="mb-1">
            <div className="flex justify-between uppercase">
              <span>{it.name || "BEVERAGE / FOOD"}</span>
              <span>{money(lineTotal(it))}</span>
            </div>
            {it.qty > 1 ? (
              <div className="text-[8px] pl-2">
                {it.qty} @ {money(it.unitPrice)}
              </div>
            ) : null}
          </div>
        ))}
        {receipt.items.length === 0 ? (
          <div className="text-center text-slate-400 py-1">NO ITEMS YET</div>
        ) : null}
      </div>

      <div className="my-2 border-t border-dashed border-slate-400" />

      {/* Totals */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between">
          <span>SUBTOTAL</span>
          <span>{money(totals.subtotal)}</span>
        </div>
        {receipt.showTax ? (
          <div className="flex justify-between">
            <span>TAX ({receipt.taxRatePct}%)</span>
            <span>{money(totals.tax)}</span>
          </div>
        ) : null}
        {receipt.showTip && totals.tip > 0 ? (
          <div className="flex justify-between">
            <span>TIP / DONATION</span>
            <span>{money(totals.tip)}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-bold text-xs mt-1 pt-1 border-t border-slate-200">
          <span>TOTAL</span>
          <span>{money(totals.total)}</span>
        </div>
      </div>

      <div className="my-2 border-t border-dashed border-slate-400" />

      {/* Payment details */}
      <div className="text-center uppercase text-[9px] mb-2">
        PAID BY {receipt.paymentMethod}
        {receipt.paymentMethod === "card" && receipt.cardLast4 ? ` ****${receipt.cardLast4}` : ""}
      </div>

      {/* Starbucks Stars */}
      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-center flex flex-col items-center gap-1 my-3">
        <span className="text-amber-500 font-bold text-xs">★ STARBUCKS REWARDS ★</span>
        <span className="text-[9px] text-slate-600">
          You earned <strong className="text-slate-800">{starsEarned} Stars</strong> on this visit!
        </span>
        <span className="text-[8px] text-slate-400">Join today via Starbucks App</span>
      </div>

      {receipt.showFooter && receipt.footerNote ? (
        <div className="text-center uppercase text-[8px] leading-tight text-slate-500 mt-2">
          {receipt.footerNote}
        </div>
      ) : (
        <div className="text-center uppercase text-[8px] leading-tight text-slate-500 mt-2">
          Thank you for stopping by Starbucks!<br />
          Tell us how we did: www.mystarbucksvisit.com
        </div>
      )}
    </div>
  );
}
