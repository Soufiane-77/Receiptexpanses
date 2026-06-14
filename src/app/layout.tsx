import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://receiptexpenses.example.com"),
  title: {
    default: "ReceiptExpenses — Make a receipt in seconds",
    template: "%s · ReceiptExpenses",
  },
  description:
    "Free online receipt generator. Pick a template, fill in your details, preview live, and download as PDF or PNG. Everything runs in your browser.",
  keywords: [
    "receipt generator",
    "make a receipt",
    "receipt maker",
    "invoice",
    "PDF receipt",
    "expense receipt",
  ],
  openGraph: {
    title: "ReceiptExpenses — Make a receipt in seconds",
    description:
      "Pick a template, fill in your details, preview live, and download as PDF or PNG. Free and private.",
    type: "website",
    siteName: "ReceiptExpenses",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReceiptExpenses — Make a receipt in seconds",
    description: "Free, private, browser-based receipt generator.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
