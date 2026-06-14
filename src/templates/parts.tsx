import type { Receipt } from "@/lib/types";
import { formatMoney } from "@/lib/calc";

/** Build a money formatter bound to a receipt's currency + locale. */
export function moneyFmt(receipt: Receipt) {
  return (amount: number) => formatMoney(amount, receipt.currency, receipt.locale);
}

/** Tailwind text size mapped from the receipt's fontSize setting. */
export function fontSizeClass(receipt: Receipt): string {
  switch (receipt.fontSize) {
    case "sm":
      return "text-xs";
    case "lg":
      return "text-base";
    default:
      return "text-sm";
  }
}

/** Business logo + name/address/phone header block. */
export function BusinessHeader({
  receipt,
  align = "center",
}: {
  receipt: Receipt;
  align?: "center" | "left";
}) {
  const { business } = receipt;
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-1 ${alignCls}`}>
      {business.logoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={business.logoDataUrl}
          alt="Business logo"
          className="mb-1 max-h-16 w-auto object-contain"
        />
      ) : null}
      <div className="text-lg font-bold leading-tight" style={{ color: receipt.accentColor }}>
        {business.name || "Your Business"}
      </div>
      {business.address ? <div className="whitespace-pre-line">{business.address}</div> : null}
      {business.phone ? <div>{business.phone}</div> : null}
    </div>
  );
}

/** A labelled total row (Subtotal / Tax / Tip / Total). */
export function TotalRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex justify-between ${strong ? "font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/** Dashed divider that mimics a torn/printed receipt line. */
export function Divider() {
  return <div className="my-2 border-t border-dashed border-slate-400" />;
}

/** A faux barcode rendered from CSS bars + the encoded value beneath. */
export function FauxBarcode({ value }: { value: string }) {
  // Deterministic bar widths derived from the value's char codes.
  const bars = Array.from(value || "000000").flatMap((ch, i) => {
    const w = (ch.charCodeAt(0) % 3) + 1;
    return [{ key: `${i}-b`, w, fill: true }, { key: `${i}-s`, w: 1, fill: false }];
  });
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-10 items-end">
        {bars.map((b) => (
          <div
            key={b.key}
            style={{ width: b.w }}
            className={`h-full ${b.fill ? "bg-black" : "bg-transparent"}`}
          />
        ))}
      </div>
      <div className="tracking-[0.3em] text-xs">{value}</div>
    </div>
  );
}

/** Payment line + optional signature line. */
export function PaymentBlock({ receipt }: { receipt: Receipt }) {
  const method =
    receipt.paymentMethod === "card"
      ? `Card${receipt.cardLast4 ? ` ****${receipt.cardLast4}` : ""}`
      : receipt.paymentMethod === "cash"
        ? "Cash"
        : "Other";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span>Payment</span>
        <span>{method}</span>
      </div>
      {receipt.showSignatureLine ? (
        <div className="mt-6">
          <div className="border-t border-slate-500" />
          <div className="mt-1 text-center text-xs text-slate-500">Signature</div>
        </div>
      ) : null}
    </div>
  );
}
