export type LineItem = {
  id: string;
  qty: number;
  name: string;
  unitPrice: number;
};

export type PaymentMethod = "cash" | "card" | "other";

export type Business = {
  name: string;
  address: string;
  phone: string;
  logoDataUrl?: string;
};

export type ReceiptMeta = {
  receiptNo: string;
  date: string; // ISO date (yyyy-mm-dd)
  time: string; // HH:mm
  cashier?: string;
};

/**
 * Template-specific extra fields. Kept loose-but-typed so a single Receipt model
 * carries data for every template; each template reads the fields it needs.
 */
export type TemplateExtras = {
  // Restaurant
  serverName?: string;
  tableNo?: string;
  // Fuel
  fuelGrade?: string;
  pumpNo?: string;
  unitLabel?: string; // e.g. "gal" or "L"
  unitsDispensed?: number;
  pricePerUnit?: number;
  // Taxi / Transport
  pickup?: string;
  dropoff?: string;
  distance?: number;
  distanceUnit?: string; // "km" | "mi"
  fare?: number;
  surcharge?: number;
  // Parking
  lotName?: string;
  entryTime?: string;
  exitTime?: string;
  ratePerHour?: number;
  // Thermal / POS
  barcodeValue?: string;
  // Airbnb
  airbnbListingName?: string;
  airbnbHostName?: string;
  airbnbCheckIn?: string;
  airbnbCheckOut?: string;
  airbnbNights?: number;
  // Walmart
  walmartStoreNo?: string;
  walmartTerminalNo?: string;
  walmartTransactionNo?: string;
  walmartTcNo?: string;
  // Amazon
  amazonOrderNo?: string;
  amazonShipmentNo?: string;
  // Uber
  uberDriverName?: string;
  uberVehicleInfo?: string;
  uberTripDuration?: string;
  // Starbucks
  starbucksStarsEarned?: string;
  starbucksCheckNo?: string;
};

export type FontSize = "sm" | "base" | "lg";

export type Receipt = {
  templateId: string;
  business: Business;
  meta: ReceiptMeta;
  items: LineItem[];
  currency: string; // ISO code; format with Intl.NumberFormat
  locale: string; // e.g. "en-US"; controls money formatting
  taxRatePct: number; // applied to subtotal
  tipAmount?: number; // restaurant / taxi
  paymentMethod: PaymentMethod;
  cardLast4?: string;
  footerNote?: string;
  showTax: boolean;
  showTip: boolean;
  showSignatureLine?: boolean;
  showBarcode?: boolean;
  showFooter: boolean;
  accentColor: string; // hex, used for header accent
  fontSize: FontSize;
  extras: TemplateExtras;
};
