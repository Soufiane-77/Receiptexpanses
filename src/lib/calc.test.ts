import { describe, expect, it } from "vitest";
import { computeTotals, formatMoney, lineTotal, round2, subtotal, taxAmount } from "./calc";
import type { LineItem, Receipt } from "./types";

const items: LineItem[] = [
  { id: "1", qty: 2, name: "Coffee", unitPrice: 3.5 },
  { id: "2", qty: 1, name: "Sandwich", unitPrice: 6.25 },
  { id: "3", qty: 3, name: "Cookie", unitPrice: 1.1 },
];

function baseReceipt(overrides: Partial<Receipt> = {}): Receipt {
  return {
    templateId: "generic",
    business: { name: "Test", address: "", phone: "" },
    meta: { receiptNo: "R-1", date: "2026-06-11", time: "10:00" },
    items,
    currency: "USD",
    locale: "en-US",
    taxRatePct: 10,
    tipAmount: 0,
    paymentMethod: "card",
    showTax: true,
    showTip: false,
    showFooter: true,
    accentColor: "#4f46e5",
    fontSize: "base",
    extras: {},
    ...overrides,
  };
}

describe("round2", () => {
  it("rounds to two decimals half-up", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.675)).toBe(2.68);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });
});

describe("lineTotal", () => {
  it("multiplies qty by unit price", () => {
    expect(lineTotal({ qty: 2, unitPrice: 3.5 })).toBe(7);
    expect(lineTotal({ qty: 3, unitPrice: 1.1 })).toBe(3.3);
  });
});

describe("subtotal", () => {
  it("sums all line items", () => {
    // 7 + 6.25 + 3.3 = 16.55
    expect(subtotal(items)).toBe(16.55);
  });
  it("is zero for empty list", () => {
    expect(subtotal([])).toBe(0);
  });
});

describe("taxAmount", () => {
  it("applies the tax rate to subtotal", () => {
    expect(taxAmount(items, 10)).toBe(1.66); // 16.55 * 0.10 = 1.655 -> 1.66
    expect(taxAmount(items, 0)).toBe(0);
  });
});

describe("computeTotals", () => {
  it("adds tax when shown", () => {
    const t = computeTotals(baseReceipt());
    expect(t.subtotal).toBe(16.55);
    expect(t.tax).toBe(1.66);
    expect(t.tip).toBe(0);
    expect(t.total).toBe(18.21);
  });

  it("omits tax when hidden", () => {
    const t = computeTotals(baseReceipt({ showTax: false }));
    expect(t.tax).toBe(0);
    expect(t.total).toBe(16.55);
  });

  it("adds tip when shown", () => {
    const t = computeTotals(baseReceipt({ showTip: true, tipAmount: 4 }));
    expect(t.tip).toBe(4);
    expect(t.total).toBe(22.21);
  });
});

describe("formatMoney", () => {
  it("formats USD", () => {
    expect(formatMoney(18.21, "USD", "en-US")).toBe("$18.21");
  });
  it("falls back gracefully on bad currency", () => {
    expect(formatMoney(5, "ZZZ", "en-US")).toContain("5.00");
  });
});
