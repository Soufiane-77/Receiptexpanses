import type { Guide } from "@/lib/guides";

// Cornerstone guide — authored + adversarially compliance-reviewed. Body uses the
// shared Block model (src/lib/blog.ts) and renders via <PostBody>.
export const receiptVsInvoice: Guide = {
  "slug": "receipt-vs-invoice",
  "title": "Receipt vs. Invoice: What's the Difference?",
  "metaTitle": "Receipt vs. Invoice: What's the Difference?",
  "metaDescription": "Receipt vs. invoice explained: an invoice requests payment before it's made; a receipt proves payment after. See the key differences, fields, and who needs each.",
  "tldr": "An invoice is a request for payment sent before money changes hands, while a receipt is proof of payment issued after the buyer has paid.",
  "datePublished": "2026-07-04",
  "dateModified": "2026-07-04",
  "category": "Comparisons",
  "body": [
    {
      "type": "p",
      "text": "A **receipt** and an **invoice** are two different documents that sit on opposite sides of a payment. An **invoice** is a request for payment: a seller issues it *before* payment to tell the buyer what they owe, for what, and by when. A **receipt** is proof of payment: the seller issues it *after* payment to confirm that money was received and the transaction is settled. In short, an invoice asks for money and a receipt acknowledges that money was paid."
    },
    {
      "type": "h2",
      "text": "The core difference in one line"
    },
    {
      "type": "p",
      "text": "The simplest way to remember it: an **invoice comes first and requests payment**, while a **receipt comes last and confirms payment**. If you are still waiting to be paid, you send an invoice. Once the customer has paid, you give them a receipt. The same underlying sale can produce both documents at different moments in its lifecycle."
    },
    {
      "type": "h2",
      "text": "Receipt vs. invoice: side-by-side comparison"
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Invoice",
        "Receipt"
      ],
      "rows": [
        [
          "Purpose",
          "Requests payment and states what is owed",
          "Confirms and proves payment was made"
        ],
        [
          "When issued",
          "Before payment (billing stage)",
          "After payment (once paid in full)"
        ],
        [
          "What it proves",
          "That a debt or obligation exists",
          "That the debt was settled"
        ],
        [
          "Typical fields",
          "Invoice number, due date, itemized charges, amount due, payment terms, seller & buyer details",
          "Receipt number, date paid, items purchased, amount paid, payment method, seller details"
        ],
        [
          "Who needs it",
          "Sellers billing clients on terms; buyers tracking what they owe",
          "Buyers needing proof for taxes, returns, reimbursement, or warranties; sellers recording income"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "What an invoice is for"
    },
    {
      "type": "p",
      "text": "An invoice is a billing document. It is most common when a seller delivers goods or services and expects payment later, rather than on the spot. Freelancers, contractors, agencies, and B2B suppliers rely on invoices to set clear payment terms (for example, \"net 30\") and to create a paper trail of what a client owes."
    },
    {
      "type": "ul",
      "items": [
        "**States what is owed** — an itemized list of products or services with quantities and prices.",
        "**Sets terms and a due date** so both sides know when payment is expected.",
        "**Carries a unique invoice number** used to track and reconcile the account.",
        "**Stays open until paid** — an unpaid invoice represents an outstanding receivable."
      ]
    },
    {
      "type": "p",
      "text": "If you bill clients for work and need a matching document once they pay, start with the [service receipt template](/receipts/service) to record the completed transaction."
    },
    {
      "type": "h2",
      "text": "What a receipt is for"
    },
    {
      "type": "p",
      "text": "A receipt is proof that a payment happened. It closes the loop on a transaction and is the document a buyer keeps for their records. Whether the sale was paid instantly at a counter or settled later against an invoice, the receipt confirms the money was received."
    },
    {
      "type": "ul",
      "items": [
        "**Proves payment** — the single most important thing a receipt does.",
        "**Supports tax deductions** by documenting a legitimate business expense.",
        "**Enables returns, refunds, and warranty claims** that often require proof of purchase.",
        "**Backs up expense reports** for reimbursement from an employer or client."
      ]
    },
    {
      "type": "p",
      "text": "Need a clean, general-purpose proof of payment for any transaction? The [generic receipt template](/receipts/generic) covers most everyday purchases, and you can [build one in the editor](/create?template=generic) in a couple of minutes."
    },
    {
      "type": "h2",
      "text": "Can one document be both?"
    },
    {
      "type": "p",
      "text": "Not exactly, but they are closely linked. In a point-of-sale purchase — buying coffee, fueling up, grabbing groceries — payment happens immediately, so you often skip a separate invoice and simply get a receipt. When payment is deferred, you get an invoice first and a receipt after you pay. Some businesses issue a document marked **\"paid\"** that looks like an invoice but functions as a receipt; the deciding factor is always whether payment has already been made."
    },
    {
      "type": "h2",
      "text": "Why the distinction matters for your records"
    },
    {
      "type": "p",
      "text": "For bookkeeping and taxes, receipts and invoices play different roles. Invoices track what you are owed or what you owe (accounts receivable and payable), while receipts substantiate money that actually moved. When you claim a business deduction, tax authorities generally want to see proof of payment — a receipt — not just a bill. This is general information and not tax or legal advice; rules vary by jurisdiction, so check with a qualified professional or your local tax authority for your situation."
    },
    {
      "type": "p",
      "text": "If you paid for something real but lost the original slip, you can reconstruct a clean record. See our guide on making a [replacement receipt for taxes](/guides/replacement-receipt-for-taxes) and what to include so it holds up in [what makes a receipt valid](/guides/what-makes-a-receipt-valid)."
    },
    {
      "type": "cta",
      "text": "Reconstruct a clear proof of payment for any real purchase in minutes — no account needed to build and preview.",
      "url": "/create?template=generic",
      "label": "Make a receipt"
    },
    {
      "type": "h2",
      "text": "Quick reference: which do you need?"
    },
    {
      "type": "ol",
      "items": [
        "**You are billing a client and waiting to be paid** → issue an invoice with terms and a due date.",
        "**A customer just paid you** → give them a receipt as proof of payment.",
        "**You need to claim a business expense on your taxes** → keep the receipt, not just the invoice.",
        "**You are requesting a refund, return, or warranty service** → present the receipt showing proof of purchase."
      ]
    },
    {
      "type": "faq",
      "items": [
        {
          "q": "Is an invoice the same as a receipt?",
          "a": "No. An invoice is a request for payment sent before the buyer pays, and a receipt is proof of payment issued after they pay. They cover the same transaction at different stages."
        },
        {
          "q": "Which comes first, the invoice or the receipt?",
          "a": "The invoice comes first. A seller issues an invoice to request payment, then issues a receipt once the buyer has paid."
        },
        {
          "q": "Do I need both an invoice and a receipt?",
          "a": "It depends on how the sale is paid. Deferred payments usually involve an invoice first and a receipt after payment. Instant, point-of-sale purchases often produce only a receipt because there is nothing to bill separately."
        },
        {
          "q": "Which document do I keep for taxes?",
          "a": "Generally the receipt, because it proves payment actually occurred. An invoice alone only shows that an amount was owed. This is general guidance, not tax advice — confirm the requirements for your jurisdiction with a professional."
        },
        {
          "q": "Can a paid invoice count as a receipt?",
          "a": "Often yes. An invoice stamped or marked 'paid,' showing the payment date and method, can serve as proof of payment. What matters is that the document clearly confirms the money was received."
        }
      ]
    },
    {
      "type": "p",
      "text": "ReceiptExpenses is a free, private, browser-based tool for creating clear receipts for real purchases you made. Everything is built client-side, so your receipt content never leaves your browser. Start from the [generic template](/receipts/generic) to record a payment, or read [how to write a receipt](/guides/how-to-write-a-receipt) for the essential fields."
    }
  ],
  "relatedGuides": [
    "how-to-write-a-receipt",
    "what-makes-a-receipt-valid",
    "replacement-receipt-for-taxes"
  ],
  "relatedTemplates": [
    "service",
    "generic"
  ]
};
