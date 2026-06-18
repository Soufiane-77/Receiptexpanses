import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing · ReceiptExpenses",
  description:
    "Preview receipts for free. Subscribe to Pro to download, print and save them — watermark-free, cancel anytime.",
};

export default function PricingPage() {
  return <PricingClient />;
}
