import type { Receipt } from "@/lib/types";
import type { Totals } from "@/lib/calc";

/** Props every template layout component receives. */
export type TemplateProps = {
  receipt: Receipt;
  totals: Totals;
};

/** Convenience: format a number with the receipt's currency + locale. */
export type MoneyFormatter = (amount: number) => string;
