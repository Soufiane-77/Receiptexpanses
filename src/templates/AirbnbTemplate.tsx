import { lineTotal } from "@/lib/calc";
import type { TemplateProps } from "./TemplateProps";
import { fontSizeClass, moneyFmt } from "./parts";
import { AirbnbLogoIcon } from "@/components/icons";

export default function AirbnbTemplate({ receipt, totals }: TemplateProps) {
  const money = moneyFmt(receipt);
  const accent = receipt.accentColor || "#FF5A5F";

  const listingName = receipt.extras.airbnbListingName || "Beautiful Cozy Apartment";
  const hostName = receipt.extras.airbnbHostName || "Host Name";
  const checkIn = receipt.extras.airbnbCheckIn || receipt.meta.date;
  const checkOut = receipt.extras.airbnbCheckOut || receipt.meta.date;
  const nights = receipt.extras.airbnbNights || 1;

  return (
    <div className={`mx-auto w-full max-w-md bg-white p-8 text-slate-800 shadow-sm border border-slate-100 ${fontSizeClass(receipt)}`}>
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-6">
        <div>
          {receipt.business.logoDataUrl ? (
            <img
              src={receipt.business.logoDataUrl}
              alt="logo"
              className="max-h-12 w-auto object-contain mb-2"
            />
          ) : (
            <div className="flex items-center gap-1.5 font-bold text-xl tracking-tight mb-2" style={{ color: accent }}>
              <AirbnbLogoIcon className="h-6 w-auto" />
              <span>{receipt.business.name || "airbnb"}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Customer Receipt</h1>
          <p className="text-xs text-slate-500 mt-1">Receipt ID: {receipt.meta.receiptNo}</p>
          <p className="text-xs text-slate-500">Issued: {receipt.meta.date} {receipt.meta.time}</p>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Paid
          </span>
        </div>
      </div>

      {/* Booking Details */}
      <div className="py-6 border-b">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Reservation Details</h2>
        <div className="font-semibold text-slate-900 text-base mb-1">{listingName}</div>
        <div className="text-slate-600 text-sm mb-4">Hosted by {hostName}</div>

        <div className="grid grid-cols-3 gap-4 bg-slate-50 rounded-xl p-4 text-center">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Check-In</div>
            <div className="font-semibold text-slate-900 mt-1">{checkIn}</div>
          </div>
          <div className="border-x border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Nights</div>
            <div className="font-semibold text-slate-900 mt-1">{nights}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Check-Out</div>
            <div className="font-semibold text-slate-900 mt-1">{checkOut}</div>
          </div>
        </div>
      </div>

      {/* Charge Breakdown */}
      <div className="py-6 border-b">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Price Breakdown</h2>
        <div className="flex flex-col gap-3">
          {receipt.items.map((it) => (
            <div key={it.id} className="flex justify-between items-baseline text-sm">
              <span className="text-slate-600">
                {it.name || "Stay charge"}
                {it.qty > 1 ? ` (${it.qty} × ${money(it.unitPrice)})` : ""}
              </span>
              <span className="font-medium text-slate-900">{money(lineTotal(it))}</span>
            </div>
          ))}
          {receipt.items.length === 0 ? (
            <div className="flex justify-between items-baseline text-sm">
              <span className="text-slate-600">Nightly rate ({nights} nights)</span>
              <span className="font-medium text-slate-900">{money(totals.subtotal)}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Totals */}
      <div className="py-6 flex flex-col gap-2 border-b">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>{money(totals.subtotal)}</span>
        </div>
        {receipt.showTax ? (
          <div className="flex justify-between text-sm text-slate-600">
            <span>Occupancy Taxes ({receipt.taxRatePct}%)</span>
            <span>{money(totals.tax)}</span>
          </div>
        ) : null}
        {receipt.showTip && totals.tip > 0 ? (
          <div className="flex justify-between text-sm text-slate-600">
            <span>Additional Fees / Tip</span>
            <span>{money(totals.tip)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-base font-bold text-slate-950 mt-2">
          <span>Total Paid</span>
          <span style={{ color: accent }}>{money(totals.total)}</span>
        </div>
      </div>

      {/* Payment details */}
      <div className="pt-6">
        <div className="text-xs text-slate-500 flex justify-between">
          <span>Payment Method</span>
          <span className="font-medium text-slate-700">
            {receipt.paymentMethod === "card"
              ? `Card ending in ${receipt.cardLast4 || "••••"}`
              : receipt.paymentMethod === "cash"
              ? "Cash Payment"
              : "Alternative Payment"}
          </span>
        </div>
        {receipt.showFooter && receipt.footerNote ? (
          <p className="text-xs text-slate-400 mt-6 text-center italic">{receipt.footerNote}</p>
        ) : (
          <p className="text-xs text-slate-400 mt-6 text-center italic">
            Thank you for choosing Airbnb! Have a wonderful and safe stay.
          </p>
        )}
      </div>
    </div>
  );
}
