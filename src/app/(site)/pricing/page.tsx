import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing · ReceiptExpenses",
  description: "Free forever. Upgrade to Pro to remove watermarks and save unlimited receipts.",
};

export default function PricingPage() {
  return <PricingClient />;
}
