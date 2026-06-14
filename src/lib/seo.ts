/** Central SEO constants and content. Update SITE_URL before deploying. */
export const SITE_URL = "https://receiptexpenses.example.com";
export const SITE_NAME = "ReceiptExpenses";

export type Faq = { q: string; a: string };

/** General FAQs — surfaced on the home page and /faq with FAQPage schema. */
export const GENERAL_FAQS: Faq[] = [
  {
    q: "Is ReceiptExpenses free?",
    a: "Yes. You can create, preview, print and download receipts as PDF or PNG for free. A Pro plan removes the small export watermark and unlocks unlimited saved receipts.",
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
    a: "No account is needed to create and download receipts. Creating a free account lets you save receipts to a dashboard and manage a subscription.",
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
      q: `Is the ${keyword} maker free?`,
      a: `Yes — creating, previewing and downloading a ${keyword} is free. Pro removes the small watermark and adds unlimited saved receipts.`,
    },
    {
      q: `Can I customise the ${keyword}?`,
      a: `Absolutely. Add your logo, change the currency and tax rate, toggle tax/tip/signature lines, and adjust the accent colour and font size.`,
    },
    ...GENERAL_FAQS.slice(0, 3),
  ];
}
