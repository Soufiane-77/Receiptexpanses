export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  author: string;
  readMins: number;
  cover: string; // emoji
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "how-to-make-a-professional-receipt",
    title: "How to make a professional receipt in under a minute",
    excerpt:
      "A clean, complete receipt builds trust and keeps your books tidy. Here's exactly what to include and how to generate one fast.",
    date: "2026-05-28",
    author: "The ReceiptExpenses Team",
    readMins: 4,
    cover: "🧾",
    body: [
      {
        type: "p",
        text: "Whether you're a freelancer invoicing a client or a small shop handing a customer proof of purchase, a clear receipt does two jobs: it reassures the other party and it keeps your records clean for tax time.",
      },
      { type: "h2", text: "What every receipt should include" },
      {
        type: "ul",
        items: [
          "Your business name, address and contact details",
          "A unique receipt number and the date/time",
          "An itemized list with quantity and unit price",
          "Subtotal, tax (with the rate), and a clearly marked total",
          "The payment method used",
        ],
      },
      { type: "h2", text: "Generate one with ReceiptExpenses" },
      {
        type: "p",
        text: "Pick a template, fill in your business and line items, and watch the live preview update as you type. When it looks right, download a PDF or PNG — or print it directly. Everything runs in your browser, so nothing is uploaded.",
      },
    ],
  },
  {
    slug: "receipts-for-freelancers-tax-season",
    title: "Receipts for freelancers: staying ready for tax season",
    excerpt:
      "Reconstructing a lost receipt or logging a cash sale? Here's how freelancers keep clean, defensible records all year.",
    date: "2026-05-12",
    author: "The ReceiptExpenses Team",
    readMins: 5,
    cover: "📊",
    body: [
      {
        type: "p",
        text: "Freelance income often arrives in messy ways — a cash payment here, a bank transfer there. Consistent receipts turn that mess into a record you can stand behind.",
      },
      { type: "h2", text: "Three habits that pay off" },
      {
        type: "ul",
        items: [
          "Issue a receipt for every sale, even small cash ones",
          "Use sequential receipt numbers so nothing looks skipped",
          "Save a copy the moment you create it — don't rely on memory",
        ],
      },
      {
        type: "p",
        text: "With a Pro account you can save unlimited receipts to your dashboard, so the whole year is one click away when your accountant asks.",
      },
    ],
  },
  {
    slug: "thermal-vs-standard-receipts",
    title: "Thermal vs. standard receipts: which template should you use?",
    excerpt:
      "From narrow POS slips to full itemized invoices, here's how to pick the right receipt format for the job.",
    date: "2026-04-30",
    author: "The ReceiptExpenses Team",
    readMins: 3,
    cover: "🖨️",
    body: [
      {
        type: "p",
        text: "ReceiptExpenses ships with six templates. Choosing the right one is mostly about context and how the receipt will be read.",
      },
      { type: "h2", text: "Quick guide" },
      {
        type: "ul",
        items: [
          "Thermal / POS — narrow, monospaced, great for quick retail sales and optional barcodes",
          "Generic Sales — a balanced itemized layout for most businesses",
          "Restaurant — adds tip and signature lines plus server/table fields",
          "Fuel, Taxi, Parking — purpose-built for those specific transactions",
        ],
      },
      {
        type: "p",
        text: "Because every template shares one data model, you can switch between them and your details carry over. Try a couple and see which reads best.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
