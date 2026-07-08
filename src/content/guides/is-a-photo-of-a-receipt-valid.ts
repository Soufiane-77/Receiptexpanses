import type { Guide } from "@/lib/guides";

// Cornerstone guide — authored + adversarially compliance-reviewed. Body uses the
// shared Block model (src/lib/blog.ts) and renders via <PostBody>.
export const isAPhotoOfAReceiptValid: Guide = {
  "slug": "is-a-photo-of-a-receipt-valid",
  "title": "Is a Photo or Screenshot of a Receipt Valid for Taxes or Reimbursement?",
  "metaTitle": "Is a Photo of a Receipt Valid for Taxes?",
  "metaDescription": "A clear photo, scan, or screenshot of a receipt is generally accepted for taxes and reimbursement if it's legible and shows every required detail. Here's how.",
  "tldr": "A photo, scan, or screenshot of a receipt is generally valid for taxes and employee reimbursement as long as it is legible and captures every required detail — the merchant, date, amount, tax, and what was purchased.",
  "datePublished": "2026-07-04",
  "dateModified": "2026-07-04",
  "category": "Taxes",
  "body": [
    {
      "type": "p",
      "text": "Yes — a photo, scan, or screenshot of a receipt is generally valid for taxes and for employee reimbursement, as long as the image is **legible and complete**. In the U.S., the IRS has long accepted electronic copies of receipts and does not require you to keep the original paper, and most employers accept clear digital images through their expense tools. The key is that the digital copy must capture everything the paper original showed: the merchant name, the date, the total amount, any tax, the payment method, and a description of what you bought. This is general information, not tax or legal advice — verify your own employer's policy and your jurisdiction's rules, or ask a professional."
    },
    {
      "type": "h2",
      "text": "The short answer: yes, if it's legible and complete"
    },
    {
      "type": "p",
      "text": "Tax authorities in many countries, including the U.S. IRS, moved to accepting electronic records years ago. In general you are allowed to scan or photograph paper receipts and discard the originals, provided the digital version is an accurate, readable reproduction. The same logic applies to reimbursement: an employer's expense system almost always accepts an uploaded image rather than a physical slip. What matters is not the *format* (paper vs. pixels) but whether the record proves the expense actually happened and shows the details needed to justify it."
    },
    {
      "type": "p",
      "text": "So a blurry, cropped, or half-faded photo can be rejected — not because it's digital, but because it fails to prove the expense. A crisp, well-lit photo of the same receipt is fine. If your paper receipt is already fading (thermal receipts fade fast), photographing or scanning it promptly is actually the *smarter* choice, because it preserves the information before the ink disappears."
    },
    {
      "type": "h2",
      "text": "What a valid receipt image must show"
    },
    {
      "type": "p",
      "text": "Whether it's a photo, a screenshot, or a scan, the image needs to clearly capture the same core fields an auditor or an approving manager would look for. See [what makes a receipt valid](/guides/what-makes-a-receipt-valid) for the full breakdown, but at minimum:"
    },
    {
      "type": "ul",
      "items": [
        "**Merchant name** and, ideally, address or contact info",
        "**Date** of the transaction",
        "**Itemized description** of the goods or services purchased",
        "**Total amount**, with **tax** shown separately where applicable",
        "**Payment method** (card, cash, last four digits of the card)",
        "The image is **in focus, well-lit, and not cropped** — every edge of the receipt is visible"
      ]
    },
    {
      "type": "p",
      "text": "If any of those are cut off or unreadable, the image may not hold up. When in doubt, take a second photo or a full scan rather than relying on one rushed snapshot."
    },
    {
      "type": "h2",
      "text": "Photo vs. scan vs. screenshot — do they all count?"
    },
    {
      "type": "table",
      "headers": [
        "Format",
        "Generally valid?",
        "Best practice"
      ],
      "rows": [
        [
          "Phone photo of a paper receipt",
          "Yes",
          "Lay it flat, good light, capture the whole receipt in focus"
        ],
        [
          "Flatbed or app scan",
          "Yes",
          "Highest quality; ideal for fading thermal receipts"
        ],
        [
          "Screenshot of an email/app receipt",
          "Yes",
          "Make sure merchant, date, total, and order number are all visible"
        ],
        [
          "Photo of a screen showing a receipt",
          "Usually, but weaker",
          "Prefer a direct screenshot or the original PDF instead"
        ],
        [
          "Original PDF from the merchant",
          "Yes — strongest",
          "Save the file directly; no re-photographing needed"
        ]
      ]
    },
    {
      "type": "p",
      "text": "For online or app-based purchases, the cleanest record is the merchant's own PDF or emailed receipt. A screenshot of that email is fine, but saving the original file is even better. For in-person paper receipts, a photo or scan is the norm and is widely accepted."
    },
    {
      "type": "h2",
      "text": "How to capture a receipt photo that will actually hold up"
    },
    {
      "type": "ol",
      "items": [
        "Place the receipt on a flat, contrasting surface (a dark table under a white receipt works well).",
        "Use good, even lighting and avoid shadows or glare from overhead lights.",
        "Fill the frame with the receipt but keep all four edges visible — don't crop off the total or the tax line.",
        "Check that the merchant name, date, amount, and line items are readable before you move on.",
        "Save it with a clear filename or note (merchant + date + purpose) so you can find it later.",
        "Store it somewhere backed up — cloud storage or your expense app — not just in your camera roll."
      ]
    },
    {
      "type": "h2",
      "text": "When the original receipt is lost, damaged, or never issued"
    },
    {
      "type": "p",
      "text": "Sometimes there's no clean receipt to photograph — the thermal ink faded to nothing, the paper was thrown out, or a vendor never handed one over. In those cases you can reconstruct the record from what you do have: a bank or card statement line, an order confirmation email, a calendar entry, or a vendor's own copy. From those details you can rebuild a clear, itemized replacement receipt so your records are complete and consistent."
    },
    {
      "type": "p",
      "text": "That's exactly what [ReceiptExpenses](/create) is built for. It's a free, private, browser-based receipt maker — an independent tool that is not affiliated with any merchant or brand it can help you record. Pick a template, fill in the real merchant, date, items, and amounts from your own transaction, and download a clean PDF or PNG. Everything stays in your browser — the receipt content never leaves your device. Use it only to reconstruct a legitimate purchase you actually made, whether that's a [restaurant meal](/restaurant-receipt-generator), a [fuel stop](/gas-receipt-generator), a [rideshare trip](/uber-receipt-generator), or a piece of [electronics or hardware](/electronics-receipt-generator) for your business. Learn more in [replacement receipt for taxes](/guides/replacement-receipt-for-taxes)."
    },
    {
      "type": "cta",
      "text": "Reconstruct a clear, complete receipt for a real purchase and download it as a PDF or PNG — free, private, no receipt data leaves your browser.",
      "url": "/create/generic",
      "label": "Make a receipt"
    },
    {
      "type": "h2",
      "text": "A note on employer reimbursement policies"
    },
    {
      "type": "p",
      "text": "While digital images are broadly accepted, individual employers set their own rules. Some require receipts above a certain dollar amount, some want the original for very large expenses, and some mandate a specific expense app. Before you toss a paper receipt, confirm what your company's expense policy says — it's the fastest way to avoid a rejected report. When you do submit, a full, legible image beats a partial one every time."
    },
    {
      "type": "faq",
      "items": [
        {
          "q": "Is a photo of a receipt valid for the IRS?",
          "a": "Generally, yes. The IRS accepts electronic copies of receipts and does not require you to keep the paper original, as long as the image is a legible, accurate reproduction that shows the merchant, date, amount, tax, and what was purchased. This is general information, not tax advice — check current IRS guidance or a tax professional for your situation."
        },
        {
          "q": "Do I need to keep the paper receipt if I have a photo?",
          "a": "In most cases, no. If your photo or scan clearly captures all the required details, you can typically rely on the digital copy. Some employers still require originals for very large expenses, so check your company policy before discarding anything."
        },
        {
          "q": "Is a screenshot of a digital receipt acceptable?",
          "a": "Yes. A screenshot of an emailed or in-app receipt is generally fine as long as the merchant name, date, total, and order details are all visible. Saving the merchant's original PDF is even stronger when it's available."
        },
        {
          "q": "My thermal receipt is fading — is a photo of it still valid?",
          "a": "Yes, and photographing or scanning it quickly is the best move. Thermal receipts fade over time, so capturing a clear image while the text is still readable preserves the record before the ink disappears."
        },
        {
          "q": "What if my receipt photo is blurry or cut off?",
          "a": "It may be rejected — not because it's a photo, but because it doesn't prove the expense. Retake it in good light with all four edges and every field (merchant, date, total, tax, items) clearly visible."
        }
      ]
    }
  ],
  "howToSteps": [
    {
      "name": "Place on a flat surface",
      "text": "Place the receipt on a flat, contrasting surface so the text stands out."
    },
    {
      "name": "Use good lighting",
      "text": "Use even lighting and avoid shadows or glare from overhead lights."
    },
    {
      "name": "Frame the whole receipt",
      "text": "Fill the frame with the receipt while keeping all four edges visible so nothing is cropped off."
    },
    {
      "name": "Check readability",
      "text": "Confirm the merchant name, date, amount, tax, and line items are all readable before moving on."
    },
    {
      "name": "Save with a clear name",
      "text": "Save the image with a clear filename or note (merchant, date, purpose) so you can find it later."
    },
    {
      "name": "Back it up",
      "text": "Store the image in backed-up cloud storage or an expense app rather than only in your camera roll."
    }
  ],
  "relatedGuides": [
    "what-makes-a-receipt-valid",
    "replacement-receipt-for-taxes",
    "how-to-write-a-receipt",
    "lost-uber-lyft-receipt"
  ],
  "relatedTemplates": [
    "generic",
    "restaurant",
    "fuel",
    "uber",
    "electronics",
    "thermal"
  ]
};
