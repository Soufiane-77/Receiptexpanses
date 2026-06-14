import { round2 } from "@/lib/calc";
import type { TemplateProps } from "./TemplateProps";
import { BusinessHeader, Divider, PaymentBlock, TotalRow, fontSizeClass, moneyFmt } from "./parts";

/** Parse "HH:mm" into minutes since midnight; null when unparseable. */
function toMinutes(hhmm?: string): number | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export default function ParkingTemplate({ receipt }: TemplateProps) {
  const money = moneyFmt(receipt);
  const e = receipt.extras;
  const start = toMinutes(e.entryTime);
  const end = toMinutes(e.exitTime);
  let durationMin = 0;
  if (start != null && end != null) {
    durationMin = end - start;
    if (durationMin < 0) durationMin += 24 * 60; // crossed midnight
  }
  const hours = durationMin / 60;
  const rate = e.ratePerHour ?? 0;
  const subtotal = round2(hours * rate);
  const tax = receipt.showTax ? round2((subtotal * receipt.taxRatePct) / 100) : 0;
  const total = round2(subtotal + tax);
  const durLabel = `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`;

  return (
    <div className={`mx-auto w-full max-w-sm bg-white p-6 text-slate-800 ${fontSizeClass(receipt)}`}>
      <div className="mb-3 border-b-4 pb-3" style={{ borderColor: receipt.accentColor }}>
        <BusinessHeader receipt={receipt} />
      </div>

      <div className="mb-2 flex flex-col gap-0.5 text-slate-600">
        <div className="flex justify-between">
          <span>Date</span>
          <span>{receipt.meta.date}</span>
        </div>
        <div className="flex justify-between">
          <span>Ticket #</span>
          <span>{receipt.meta.receiptNo}</span>
        </div>
        {e.lotName ? (
          <div className="flex justify-between">
            <span>Lot</span>
            <span>{e.lotName}</span>
          </div>
        ) : null}
      </div>

      <Divider />

      <div className="flex flex-col gap-0.5">
        {e.entryTime ? <TotalRow label="Entry" value={e.entryTime} /> : null}
        {e.exitTime ? <TotalRow label="Exit" value={e.exitTime} /> : null}
        <TotalRow label="Duration" value={durLabel} />
        <TotalRow label="Rate / hour" value={money(rate)} />
      </div>

      <Divider />

      <div className="flex flex-col gap-0.5">
        <TotalRow label="Subtotal" value={money(subtotal)} />
        {receipt.showTax ? (
          <TotalRow label={`Tax (${receipt.taxRatePct}%)`} value={money(tax)} />
        ) : null}
        <div className="mt-1 border-t border-slate-300 pt-1">
          <TotalRow label="Total" value={money(total)} strong />
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
