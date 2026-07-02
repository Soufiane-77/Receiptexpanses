import type { Metadata } from "next";
import Script from "next/script";
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
  metadataBase: new URL("https://receiptexpenses.com"),
  title: {
    default: "ReceiptExpenses — Make a receipt in seconds",
    template: "%s · ReceiptExpenses",
  },
  description:
    "Online receipt generator — pick a template, fill in details, preview free, then subscribe to download a PDF or PNG. Everything runs in your browser.",
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
      "Pick a template, fill in your details, and preview live. Subscribe to download as PDF or PNG. Private by design.",
    type: "website",
    siteName: "ReceiptExpenses",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ReceiptExpenses — online receipt maker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReceiptExpenses — Make a receipt in seconds",
    description: "Private, browser-based receipt generator. Preview free, subscribe to download.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        {/* Injects window.__ENV__ (Supabase runtime config) before hydration.
            Kept out of the build so config lives only as Cloudflare env. */}
        <Script src="/api/env" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
