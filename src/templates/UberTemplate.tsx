import type { TemplateProps } from "./TemplateProps";
import { fontSizeClass, moneyFmt } from "./parts";
import { UberLogoIcon } from "@/components/icons";

export default function UberTemplate({ receipt, totals }: TemplateProps) {
  const money = moneyFmt(receipt);

  const pickup = receipt.extras.pickup || "100 Broadway, New York, NY";
  const dropoff = receipt.extras.dropoff || "500 5th Ave, New York, NY";
  const distance = receipt.extras.distance || 3.8;
  const distanceUnit = receipt.extras.distanceUnit || "mi";
  const driverName = receipt.extras.uberDriverName || "David";
  const vehicleInfo = receipt.extras.uberVehicleInfo || "Toyota Camry (UberX)";
  const duration = receipt.extras.uberTripDuration || "18 min";

  return (
    <div className={`mx-auto w-full max-w-sm bg-white text-slate-800 border border-slate-200 shadow-sm overflow-hidden ${fontSizeClass(receipt)}`}>
      {/* Dark Uber Header */}
      <div className="bg-black p-6 text-white text-center flex flex-col items-center select-none">
        {receipt.business.logoDataUrl ? (
          <img
            src={receipt.business.logoDataUrl}
            alt="logo"
            className="max-h-8 w-auto object-contain invert mb-2"
          />
        ) : (
          <div className="flex justify-center mb-1">
            <UberLogoIcon className="h-6 w-auto text-white" />
          </div>
        )}
        <div className="text-xs text-slate-400">Ride Receipt</div>
        <div className="text-2xl font-bold tracking-tight mt-3">
          {money(totals.total)}
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          {receipt.meta.date} {receipt.meta.time}
        </div>
      </div>

      <div className="p-6">
        {/* Driver / Vehicle info */}
        <div className="flex items-center gap-3 border-b pb-4 mb-4 text-xs">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
            {driverName[0] || "D"}
          </div>
          <div>
            <div className="font-semibold text-slate-900">You rode with {driverName}</div>
            <div className="text-slate-500">{vehicleInfo} · {duration} · {distance}{distanceUnit}</div>
          </div>
        </div>

        {/* Fare Breakdown */}
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Fare Breakdown</h2>
        <div className="flex flex-col gap-2.5 text-xs pb-4 border-b">
          <div className="flex justify-between">
            <span className="text-slate-600">Trip Fare (Subtotal)</span>
            <span className="font-medium text-slate-900">{money(totals.subtotal)}</span>
          </div>
          {receipt.showTax ? (
            <div className="flex justify-between">
              <span className="text-slate-600">Tolls &amp; Fees</span>
              <span className="font-medium text-slate-900">{money(totals.tax)}</span>
            </div>
          ) : null}
          {receipt.showTip && totals.tip > 0 ? (
            <div className="flex justify-between">
              <span className="text-slate-600">Tip</span>
              <span className="font-medium text-slate-900">{money(totals.tip)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-bold text-slate-950 text-sm mt-1">
            <span>Total Paid</span>
            <span>{money(totals.total)}</span>
          </div>
        </div>

        {/* Payment and Route Info */}
        <div className="py-4 border-b text-xs">
          <div className="flex justify-between mb-4">
            <span className="text-slate-500">Payment</span>
            <span className="font-semibold text-slate-700">
              {receipt.paymentMethod === "card"
                ? `Card ending in ${receipt.cardLast4 || "••••"}`
                : receipt.paymentMethod === "cash"
                ? "Cash"
                : "Other"}
            </span>
          </div>

          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Trip Details</h2>
          <div className="flex gap-3 relative pl-1">
            {/* CSS-based vertical route line */}
            <div className="absolute left-[7px] top-[6px] bottom-[6px] w-[2px] bg-slate-300" />
            <div className="flex flex-col gap-5 justify-between">
              {/* Pickup dot */}
              <div className="h-3 w-3 rounded-full bg-slate-900 z-10 outline outline-4 outline-white" />
              {/* Dropoff dot */}
              <div className="h-3 w-3 rounded-none bg-slate-900 z-10 outline outline-4 outline-white" />
            </div>
            <div className="flex flex-col gap-3 justify-between text-[11px] leading-tight flex-1">
              <div>
                <span className="font-semibold text-slate-700 block">Pickup</span>
                <span className="text-slate-500">{pickup}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Dropoff</span>
                <span className="text-slate-500">{dropoff}</span>
              </div>
            </div>
          </div>
        </div>

        {receipt.showFooter && receipt.footerNote ? (
          <div className="mt-4 text-center text-[10px] text-slate-400 italic">
            {receipt.footerNote}
          </div>
        ) : (
          <div className="mt-4 text-center text-[10px] text-slate-400">
            Fares include applicable VAT/taxes. Thank you for riding with Uber!
          </div>
        )}
      </div>
    </div>
  );
}
