import type { Metadata } from "next";
import { PAYMENTS_ENABLED } from "@/lib/features";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing · ReceiptExpenses",
  description: PAYMENTS_ENABLED
    ? "Preview receipts for free. Subscribe to Pro to download, print and save them — watermark-free, cancel anytime."
    : "ReceiptExpenses is free. Build and preview receipts without an account; download, print and save them with a free account (email or Google sign-up).",
};

export default function PricingPage() {
  return <PricingClient />;
}
