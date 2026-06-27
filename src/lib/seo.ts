/** Central SEO constants and content. Update SITE_URL before deploying. */
export const SITE_URL = "https://receiptexpenses.com";
export const SITE_NAME = "ReceiptExpenses";

export type Faq = { q: string; a: string };

/** General FAQs — surfaced on the home page and /faq with FAQPage schema. */
export const GENERAL_FAQS: Faq[] = [
  {
    q: "How much does ReceiptExpenses cost?",
    a: "ReceiptExpenses is free. Build and preview any receipt without an account; create a free account (with your email or Google) to download it as a PDF or PNG, print it, or save it to your dashboard.",
  },
  {
    q: "Is my data private?",
    a: "Completely. ReceiptExpenses runs entirely in your browser — your business details, logo and receipts are never uploaded to a server. Logos are stored locally as data URLs.",
  },
  {
    q: "What receipt formats can I download?",
    a: "You can export a pixel-perfect PDF or PNG of exactly what you see in the live preview, and you can print directly from your browser.",
  },
  {
    q: "Can I add my own logo and currency?",
    a: "Yes. Upload a logo, pick from many currencies formatted correctly for each region, set your tax rate, and adjust the accent colour and font size.",
  },
  {
    q: "What can I use the receipts for?",
    a: "ReceiptExpenses is for generating receipts for your own business, freelancing or personal record-keeping — for example reconstructing a lost receipt of a real purchase. Templates are generic and brandable; please don't impersonate real named retailers.",
  },
  {
    q: "Do I need an account?",
    a: "You can build and preview a receipt without an account. To download, print or save it you'll create a free account — sign up with your email or continue with Google in one click.",
  },
];

/** Build FAQs for a specific receipt type, blending type-specific + general. */
export function faqsForType(name: string, keyword: string): Faq[] {
  return [
    {
      q: `How do I make a ${keyword} online?`,
      a: `Pick the ${name} template, fill in your business details and line items in the form on the left, and watch the receipt build live on the right. When it looks right, download it as a PDF or PNG.`,
    },
    {
      q: `How much does the ${keyword} maker cost?`,
      a: `It's free. Building and previewing a ${keyword} needs no account; downloading it as a PDF or PNG, printing or saving it just requires a free account (sign up with email or Google).`,
    },
    {
      q: `Can I customise the ${keyword}?`,
      a: `Absolutely. Add your logo, change the currency and tax rate, toggle tax/tip/signature lines, and adjust the accent colour and font size.`,
    },
    ...GENERAL_FAQS.slice(0, 3),
  ];
}
