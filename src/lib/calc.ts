import type { LineItem, Receipt } from "./types";

/** Round to 2 decimals using half-up, avoiding binary float drift. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function lineTotal(item: Pick<LineItem, "qty" | "unitPrice">): number {
  return round2(item.qty * item.unitPrice);
}

export function subtotal(items: LineItem[]): number {
  return round2(items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0));
}

export function taxAmount(items: LineItem[], taxRatePct: number): number {
  return round2(subtotal(items) * (taxRatePct / 100));
}

export type Totals = {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
};

/**
 * Compute receipt totals respecting visibility toggles.
 * total = subtotal + (tax if shown) + (tip if shown)
 */
export function computeTotals(receipt: Receipt): Totals {
  let sub = 0;
  if (receipt.templateId === "fuel") {
    sub = round2((receipt.extras.unitsDispensed ?? 0) * (receipt.extras.pricePerUnit ?? 0));
  } else if (receipt.templateId === "taxi") {
    sub = round2((receipt.extras.fare ?? 0) + (receipt.extras.surcharge ?? 0));
  } else if (receipt.templateId === "uber") {
    sub = round2(receipt.extras.fare ?? 0);
  } else if (receipt.templateId === "parking") {
    const toMin = (t?: string) => {
      if (!t) return 0;
      const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
      return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
    };
    const start = toMin(receipt.extras.entryTime);
    let end = toMin(receipt.extras.exitTime);
    if (end < start) end += 24 * 60;
    const hours = (end - start) / 60;
    sub = round2(hours * (receipt.extras.ratePerHour ?? 0));
  } else {
    sub = subtotal(receipt.items);
  }

  let tax = 0;
  if (receipt.showTax) {
    if (receipt.templateId === "uber") {
      tax = round2(receipt.extras.surcharge ?? 0);
    } else if (
      receipt.templateId === "fuel" ||
      receipt.templateId === "taxi" ||
      receipt.templateId === "parking"
    ) {
      tax = round2(sub * (receipt.taxRatePct / 100));
    } else {
      tax = taxAmount(receipt.items, receipt.taxRatePct);
    }
  }

  const tip = receipt.showTip ? round2(receipt.tipAmount ?? 0) : 0;

  return {
    subtotal: sub,
    tax,
    tip,
    total: round2(sub + tax + tip),
  };
}

/** Format a numeric amount as currency for the receipt's locale + currency. */
export function formatMoney(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    // Fallback if an invalid currency/locale slips through.
    return `${currency} ${round2(amount).toFixed(2)}`;
  }
}
