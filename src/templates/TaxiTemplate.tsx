import { round2 } from "@/lib/calc";
import type { TemplateProps } from "./TemplateProps";
import { BusinessHeader, Divider, PaymentBlock, TotalRow, fontSizeClass, moneyFmt } from "./parts";

export default function TaxiTemplate({ receipt }: TemplateProps) {
  const money = moneyFmt(receipt);
  const e = receipt.extras;
  const fare = e.fare ?? 0;
  const surcharge = e.surcharge ?? 0;
  const tip = receipt.showTip ? receipt.tipAmount ?? 0 : 0;
  const total = round2(fare + surcharge + tip);

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
          <span>Trip #</span>
          <span>{receipt.meta.receiptNo}</span>
        </div>
      </div>

      <Divider />

      <div className="flex flex-col gap-0.5">
        {e.pickup ? <TotalRow label="Pickup" value={e.pickup} /> : null}
        {e.dropoff ? <TotalRow label="Dropoff" value={e.dropoff} /> : null}
        {e.distance != null ? (
          <TotalRow label="Distance" value={`${e.distance} ${e.distanceUnit ?? "km"}`} />
        ) : null}
      </div>

      <Divider />

      <div className="flex flex-col gap-0.5">
        <TotalRow label="Fare" value={money(fare)} />
        {surcharge > 0 ? <TotalRow label="Surcharge" value={money(surcharge)} /> : null}
        {receipt.showTip ? <TotalRow label="Tip" value={money(tip)} /> : null}
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
