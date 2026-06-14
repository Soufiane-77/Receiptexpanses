export type CurrencyOption = { code: string; label: string; locale: string };

/** Supported currencies with a sensible default formatting locale per currency. */
export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "US Dollar ($)", locale: "en-US" },
  { code: "EUR", label: "Euro (€)", locale: "de-DE" },
  { code: "GBP", label: "British Pound (£)", locale: "en-GB" },
  { code: "INR", label: "Indian Rupee (₹)", locale: "en-IN" },
  { code: "MAD", label: "Moroccan Dirham (DH)", locale: "fr-MA" },
  { code: "JPY", label: "Japanese Yen (¥)", locale: "ja-JP" },
  { code: "CAD", label: "Canadian Dollar (C$)", locale: "en-CA" },
  { code: "AUD", label: "Australian Dollar (A$)", locale: "en-AU" },
  { code: "AED", label: "UAE Dirham (د.إ)", locale: "ar-AE" },
  { code: "CNY", label: "Chinese Yuan (¥)", locale: "zh-CN" },
];

export function localeForCurrency(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.locale ?? "en-US";
}
