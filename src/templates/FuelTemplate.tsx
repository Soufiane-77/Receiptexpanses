import { round2 } from "@/lib/calc";
import type { TemplateProps } from "./TemplateProps";
import { BusinessHeader, Divider, PaymentBlock, TotalRow, fontSizeClass, moneyFmt } from "./parts";

export default function FuelTemplate({ receipt, totals }: TemplateProps) {
  const money = moneyFmt(receipt);
  const e = receipt.extras;
  const units = e.unitsDispensed ?? 0;
  const ppu = e.pricePerUnit ?? 0;
  const fuelCost = round2(units * ppu);

  return (
    <div className={`mx-auto w-full max-w-sm bg-white p-6 text-slate-800 ${fontSizeClass(receipt)}`}>
      <div className="mb-3 border-b-4 pb-3" style={{ borderColor: receipt.accentColor }}>
        <BusinessHeader receipt={receipt} />
      </div>

      <div className="mb-2 flex flex-col gap-0.5 text-slate-600">
        <div className="flex justify-between">
          <span>Date</span>
          <span>
            {receipt.meta.date} {receipt.meta.time}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Receipt #</span>
          <span>{receipt.meta.receiptNo}</span>
        </div>
        {e.pumpNo ? (
          <div className="flex justify-between">
            <span>Pump</span>
            <span>{e.pumpNo}</span>
          </div>
        ) : null}
      </div>

      <Divider />

      <div className="flex flex-col gap-0.5">
        {e.fuelGrade ? <TotalRow label="Grade" value={e.fuelGrade} /> : null}
        <TotalRow
          label={`Quantity (${e.unitLabel ?? "gal"})`}
          value={units.toFixed(3)}
        />
        <TotalRow label={`Price / ${e.unitLabel ?? "gal"}`} value={money(ppu)} />
        <TotalRow label="Fuel Total" value={money(fuelCost)} />
      </div>

      <Divider />

      <div className="flex flex-col gap-0.5">
        <TotalRow label="Subtotal" value={money(fuelCost)} />
        {receipt.showTax ? (
          <TotalRow label={`Tax (${receipt.taxRatePct}%)`} value={money(round2(fuelCost * receipt.taxRatePct / 100))} />
        ) : null}
        <div className="mt-1 border-t border-slate-300 pt-1">
          <TotalRow
            label="Total"
            value={money(round2(fuelCost + (receipt.showTax ? (fuelCost * receipt.taxRatePct) / 100 : 0)))}
            strong
          />
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
