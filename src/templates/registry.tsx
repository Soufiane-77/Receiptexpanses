import type { ComponentType } from "react";
import type { TemplateProps } from "./TemplateProps";
import GenericTemplate from "./GenericTemplate";
import RestaurantTemplate from "./RestaurantTemplate";
import ThermalTemplate from "./ThermalTemplate";
import FuelTemplate from "./FuelTemplate";
import TaxiTemplate from "./TaxiTemplate";
import ParkingTemplate from "./ParkingTemplate";
import AirbnbTemplate from "./AirbnbTemplate";
import WalmartTemplate from "./WalmartTemplate";
import AmazonTemplate from "./AmazonTemplate";
import UberTemplate from "./UberTemplate";
import StarbucksTemplate from "./StarbucksTemplate";

export type TemplateCategory = "Business" | "Food & Drink" | "Retail" | "Travel" | "Services";

export const CATEGORIES: TemplateCategory[] = [
  "Business",
  "Food & Drink",
  "Retail",
  "Travel",
  "Services",
];

export type TemplateDef = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  /** Emoji kept only as a non-UI fallback; UI renders <TemplateIcon> (SVG). */
  thumbnail: string;
  Component: ComponentType<TemplateProps>;
  /** Optional brand accent hex colour for the template card icon area. */
  brandColor?: string;
  /** Optional short brand label shown as a badge on the card (e.g. "Airbnb"). */
  brandLabel?: string;
  /** SEO copy for the per-type landing page. */
  seo: {
    /** e.g. "restaurant" → used in slug /receipts/restaurant and H1 keyword. */
    keyword: string;
    blurb: string;
    useCases: string[];
  };
};

/**
 * Single source of truth for templates. Adding a new template is ONE entry here
 * (a layout component can be reused across several entries). The landing grid,
 * editor dropdown, SEO landing pages and sitemap all derive from this list.
 */
const RAW_TEMPLATES: TemplateDef[] = [
  {
    id: "generic",
    name: "Generic Sales Receipt",
    description: "Business header, itemized list, subtotal/tax/total and a footer note.",
    category: "Business",
    thumbnail: "🧾",
    Component: GenericTemplate,
    seo: {
      keyword: "sales receipt",
      blurb:
        "Create a clean, professional sales receipt for any business in seconds — itemized lines, tax, totals and your own logo.",
      useCases: [
        "Proof of purchase for a customer",
        "Reconstructing a lost receipt for your records",
        "Simple cash or card sale documentation",
      ],
    },
  },
  {
    id: "airbnb",
    name: "Airbnb Style Receipt",
    description: "Modern guest lodging receipt with check-in/out details and booking fees.",
    category: "Travel",
    thumbnail: "🏠",
    Component: AirbnbTemplate,
    brandColor: "#FF5A5F",
    brandLabel: "Airbnb",
    seo: {
      keyword: "Airbnb receipt",
      blurb:
        "Reconstruct a lodging and vacation-rental expense receipt styled after an Airbnb invoice — for documenting a stay you actually booked when you need a replacement record for travel reimbursement or tax deductions. Customizable guest details, check-in dates and host fees.",
      useCases: [
        "Business-travel lodging reimbursement documentation",
        "Replacing a lost vacation-rental receipt for tax records",
        "Short-stay host bookkeeping and per-diem expense logs",
      ],
    },
  },
  {
    id: "walmart",
    name: "Walmart Style Receipt",
    description: "Thermal POS slip layout featuring terminal/op details and a savings summary.",
    category: "Retail",
    thumbnail: "🏬",
    Component: WalmartTemplate,
    brandColor: "#0071CE",
    brandLabel: "Walmart",
    seo: {
      keyword: "Walmart receipt",
      blurb:
        "Reconstruct a superstore expense receipt in the thermal point-of-sale layout used by big-box retailers like Walmart — for replacing a receipt you lost after a real purchase so you can keep accurate expense and tax records. Includes store/lane details and totals.",
      useCases: [
        "Replacing a lost supercenter receipt for expense records",
        "Small-business retail purchase and tax-deduction tracking",
        "Reconstructing proof of a purchase you actually made",
      ],
    },
  },
  {
    id: "amazon",
    name: "Amazon Style Invoice",
    description: "E-commerce digital order confirmation showing shipping, taxes, and item lists.",
    category: "Retail",
    thumbnail: "📦",
    Component: AmazonTemplate,
    brandColor: "#FF9900",
    brandLabel: "Amazon",
    seo: {
      keyword: "Amazon receipt",
      blurb:
        "Rebuild an online-order expense receipt styled after an Amazon invoice — for documenting a business or personal purchase you actually made when the original order confirmation is lost and you need a record for reimbursement, warranty or tax deductions. Customizable items, shipping and totals.",
      useCases: [
        "Documenting business equipment and supply purchases for taxes",
        "Replacing a lost online-order confirmation for reimbursement",
        "Expense reconciliation for 1099 and small-business bookkeeping",
      ],
    },
  },
  {
    id: "uber",
    name: "Uber Style Ride Receipt",
    description: "Modern taxi/rideshare digital slip showing map-route details and trip breakdowns.",
    category: "Travel",
    thumbnail: "🚕",
    Component: UberTemplate,
    brandColor: "#000000",
    brandLabel: "Uber",
    seo: {
      keyword: "Uber receipt",
      blurb:
        "Reconstruct a rideshare travel-expense receipt styled after an Uber trip invoice — for documenting a ride you actually took when you need a replacement record for work travel reimbursement or a tax deduction. Includes trip, fare and route details.",
      useCases: [
        "Rideshare travel-expense reimbursement for work trips",
        "Replacing a lost trip receipt for 1099 mileage/transport records",
        "Business-travel transportation expense reports",
      ],
    },
  },
  {
    id: "starbucks",
    name: "Starbucks Style Receipt",
    description: "Coffee shop thermal ticket with check number, cashier info, and reward points.",
    category: "Food & Drink",
    thumbnail: "☕",
    Component: StarbucksTemplate,
    brandColor: "#00704A",
    brandLabel: "Starbucks",
    seo: {
      keyword: "Starbucks receipt",
      blurb:
        "Reconstruct a coffee-shop expense receipt in the thermal register style used by chains like Starbucks — for documenting a business meeting coffee or meal you actually paid for when you need a replacement record for reimbursement or a meal-expense deduction. Includes items and totals.",
      useCases: [
        "Business meeting and client coffee/meal expense documentation",
        "Replacing a lost café receipt for reimbursement",
        "Meal-expense record keeping for freelancers and 1099 filers",
      ],
    },
  },
  {
    id: "service",
    name: "Service Invoice Receipt",
    description: "Itemized services with totals — ideal for freelancers and contractors.",
    category: "Services",
    thumbnail: "🧰",
    Component: GenericTemplate,
    seo: {
      keyword: "service receipt",
      blurb:
        "Bill for your time and services with an itemized receipt freelancers and contractors can hand to any client.",
      useCases: [
        "Freelance project payment proof",
        "Handyman or contractor job receipt",
        "Consulting or hourly service billing",
      ],
    },
  },
  {
    id: "restaurant",
    name: "Restaurant Receipt",
    description: "Items, tax, tip line, signature line, server and table fields.",
    category: "Food & Drink",
    thumbnail: "🍽️",
    Component: RestaurantTemplate,
    seo: {
      keyword: "restaurant receipt",
      blurb:
        "Generate a restaurant receipt with itemized dishes, tax, a tip line and signature — perfect for dining records.",
      useCases: [
        "Meal expense reimbursement",
        "Dining-out record keeping",
        "Tip and server documentation",
      ],
    },
  },
  {
    id: "cafe",
    name: "Café / Coffee Receipt",
    description: "Compact thermal-style slip for cafés, coffee shops and quick bites.",
    category: "Food & Drink",
    thumbnail: "☕",
    Component: ThermalTemplate,
    seo: {
      keyword: "coffee shop receipt",
      blurb:
        "A narrow thermal-style café receipt for coffee shops and quick-service spots — itemized drinks and a tidy total.",
      useCases: ["Coffee run expense", "Café proof of purchase", "Quick-service food slip"],
    },
  },
  {
    id: "thermal",
    name: "Thermal / POS Receipt",
    description: "Narrow monospaced thermal-printer look with an optional barcode.",
    category: "Retail",
    thumbnail: "🖨️",
    Component: ThermalTemplate,
    seo: {
      keyword: "POS receipt",
      blurb:
        "The classic narrow thermal point-of-sale receipt, monospaced with an optional barcode for that printed-at-the-register look.",
      useCases: ["Retail point-of-sale slip", "Barcode receipt", "Compact printed receipt"],
    },
  },
  {
    id: "grocery",
    name: "Grocery / Market Receipt",
    description: "Long itemized grocery list with subtotal, tax and total.",
    category: "Retail",
    thumbnail: "🛒",
    Component: ThermalTemplate,
    seo: {
      keyword: "grocery receipt",
      blurb:
        "Produce an itemized grocery or market receipt with a long product list, tax and total in the familiar printed style.",
      useCases: ["Grocery expense tracking", "Household budgeting", "Replacing a lost market receipt"],
    },
  },
  {
    id: "fuel",
    name: "Fuel / Gas Receipt",
    description: "Gallons/litres, price per unit, pump number and fuel grade.",
    category: "Travel",
    thumbnail: "⛽",
    Component: FuelTemplate,
    seo: {
      keyword: "gas receipt",
      blurb:
        "Create a fuel or gas station receipt with gallons or litres, price per unit, pump number and grade.",
      useCases: ["Mileage and fuel reimbursement", "Business travel fuel logs", "Fleet expense records"],
    },
  },
  {
    id: "taxi",
    name: "Taxi / Transport Receipt",
    description: "Pickup/dropoff, distance, fare, surcharge and tip.",
    category: "Travel",
    thumbnail: "🚕",
    Component: TaxiTemplate,
    seo: {
      keyword: "taxi receipt",
      blurb:
        "Generate a taxi or rideshare receipt with pickup and dropoff, distance, fare, surcharge and tip.",
      useCases: ["Travel expense reimbursement", "Rideshare record keeping", "Business trip transport logs"],
    },
  },
  {
    id: "parking",
    name: "Parking Receipt",
    description: "Entry/exit time, duration, hourly rate and lot name.",
    category: "Travel",
    thumbnail: "🅿️",
    Component: ParkingTemplate,
    seo: {
      keyword: "parking receipt",
      blurb:
        "Make a parking receipt with entry and exit times, duration, hourly rate and the lot or garage name.",
      useCases: ["Parking expense claims", "Garage and lot records", "Event or airport parking proof"],
    },
  },
  {
    id: "hotel",
    name: "Hotel / Lodging Receipt",
    description: "Room charges and fees itemized with tax and total.",
    category: "Travel",
    thumbnail: "🏨",
    Component: GenericTemplate,
    seo: {
      keyword: "hotel receipt",
      blurb:
        "Create a hotel or lodging receipt with itemized room nights and fees, tax and a grand total for travel records.",
      useCases: ["Travel lodging reimbursement", "Hotel stay record keeping", "Per-diem documentation"],
    },
  },
  {
    id: "vacation-rental",
    name: "Vacation Rental Receipt",
    description: "Nightly rate plus cleaning and service fees, tax and total — for short-stay hosts.",
    category: "Travel",
    thumbnail: "🏝️",
    Component: GenericTemplate,
    seo: {
      keyword: "vacation rental receipt",
      blurb:
        "Create a vacation rental or short-stay receipt with a nightly rate, cleaning and service fees, tax and total — branded as your own rental business.",
      useCases: [
        "Short-stay host record keeping",
        "Guest proof of payment",
        "Travel lodging reimbursement",
      ],
    },
  },
  {
    id: "bigbox",
    name: "Superstore / Big-Box Receipt",
    description: "Dense itemized superstore-style slip with a savings line and barcode.",
    category: "Retail",
    thumbnail: "🏬",
    Component: ThermalTemplate,
    seo: {
      keyword: "superstore receipt",
      blurb:
        "Generate a dense, big-box superstore-style receipt with a long itemized list, totals and a barcode — generic and brandable for your own store.",
      useCases: ["Retail proof of purchase", "Household expense tracking", "Reconstructing a lost slip"],
    },
  },
  {
    id: "pharmacy",
    name: "Pharmacy Receipt",
    description: "Itemized pharmacy purchase with tax and total.",
    category: "Services",
    thumbnail: "💊",
    Component: GenericTemplate,
    seo: {
      keyword: "pharmacy receipt",
      blurb:
        "Create a pharmacy or drug-store receipt with itemized purchases, tax and total for your own pharmacy or for personal records.",
      useCases: ["Health-spending account records", "Insurance reimbursement", "Personal medical expenses"],
    },
  },
  {
    id: "electronics",
    name: "Electronics Store Receipt",
    description: "Itemized electronics purchase with tax, total and card details.",
    category: "Retail",
    thumbnail: "💻",
    Component: GenericTemplate,
    seo: {
      keyword: "electronics receipt",
      blurb:
        "Produce an electronics store receipt with itemized devices, tax, total and card details — perfect for warranty and expense records.",
      useCases: ["Warranty and return records", "Business equipment expensing", "Personal purchase tracking"],
    },
  },
  {
    id: "marketplace",
    name: "Online Order Receipt",
    description: "Order number, itemized products, shipping and total for online sales.",
    category: "Business",
    thumbnail: "📦",
    Component: GenericTemplate,
    seo: {
      keyword: "online order receipt",
      blurb:
        "Create an online order or marketplace receipt with an order number, itemized products, shipping and total for your own store.",
      useCases: ["E-commerce order confirmation", "Marketplace seller records", "Shipping and fulfilment proof"],
    },
  },
  {
    id: "nike",
    name: "Nike Receipt",
    description: "Itemized Nike store purchase with order number.",
    category: "Retail",
    thumbnail: "👟",
    Component: GenericTemplate,
    brandColor: "#111111",
    brandLabel: "NIKE",
    seo: {
      keyword: "nike receipt",
      blurb:
        "Reconstruct an athletic-apparel expense receipt styled after a Nike store purchase — for documenting footwear or gear you actually bought when you need a replacement record for a business expense, resale-inventory log or tax deduction. Customizable items, order number and totals.",
      useCases: [
        "Fitness coaches & creators logging apparel/gear as a business expense",
        "Replacing a lost store receipt for expense records",
        "Resale-inventory and cost-basis documentation",
      ],
    },
  },
  {
    id: "adidas",
    name: "Adidas Receipt",
    description: "Itemized Adidas store purchase with order number.",
    category: "Retail",
    thumbnail: "👟",
    Component: GenericTemplate,
    brandColor: "#000000",
    brandLabel: "ADIDAS",
    seo: {
      keyword: "adidas receipt",
      blurb:
        "Reconstruct an athletic-apparel expense receipt styled after an Adidas store purchase — for documenting footwear or gear you actually bought when you need a replacement record for a business expense, resale-inventory log or tax deduction. Customizable items, order number and totals.",
      useCases: [
        "Fitness coaches & creators logging apparel/gear as a business expense",
        "Replacing a lost store receipt for expense records",
        "Resale-inventory and cost-basis documentation",
      ],
    },
  },
  {
    id: "apple",
    name: "Apple Receipt",
    description: "Itemized Apple store purchase with order number.",
    category: "Retail",
    thumbnail: "📱",
    Component: GenericTemplate,
    brandColor: "#000000",
    brandLabel: "APPLE",
    seo: {
      keyword: "apple receipt",
      blurb:
        "Reconstruct a hardware expense receipt styled after an Apple store purchase — for documenting a Mac, iPhone, iPad or accessory you actually bought when you need a replacement record for business-equipment tax deductions, warranty files or reimbursement. Customizable items, order number and totals.",
      useCases: [
        "Documenting business hardware & tech purchases for 1099/small-business taxes",
        "Warranty and AppleCare expense records",
        "Replacing a lost device receipt for reimbursement",
      ],
    },
  },
  {
    id: "jordan",
    name: "Jordan Receipt",
    description: "Itemized Jordan store purchase with order number.",
    category: "Retail",
    thumbnail: "🏀",
    Component: GenericTemplate,
    brandColor: "#E32636",
    brandLabel: "JORDAN",
    seo: {
      keyword: "jordan receipt",
      blurb:
        "Reconstruct a footwear expense receipt styled after a Jordan brand purchase — for documenting sneakers or apparel you actually bought when you need a replacement record for resale cost-basis, a business expense or a tax deduction. Customizable items, order number and totals.",
      useCases: [
        "Sneaker resellers logging cost basis for inventory and taxes",
        "Creators & coaches expensing apparel as a business cost",
        "Replacing a lost store receipt for expense records",
      ],
    },
  },
];

const BRANDS = ["airbnb", "walmart", "amazon", "uber", "starbucks", "nike", "adidas", "apple", "jordan"];
const brandTemplates = RAW_TEMPLATES.filter((t) => BRANDS.includes(t.id));
const genericTemplates = RAW_TEMPLATES.filter((t) => !BRANDS.includes(t.id));

export const TEMPLATES: TemplateDef[] = [...brandTemplates, ...genericTemplates];

const TEMPLATE_MAP = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplate(id: string): TemplateDef {
  return TEMPLATE_MAP.get(id) ?? TEMPLATES[0]!;
}

export const DEFAULT_TEMPLATE_ID = "generic";
