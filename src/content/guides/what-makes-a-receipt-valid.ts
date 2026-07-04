import type { Guide } from "@/lib/guides";

// Cornerstone guide — authored + adversarially compliance-reviewed. Body uses the
// shared Block model (src/lib/blog.ts) and renders via <PostBody>.
export const whatMakesAReceiptValid: Guide = {
  "slug": "what-makes-a-receipt-valid",
  "title": "What Has to Be on a Legally Valid Receipt",
  "metaTitle": "What Makes a Receipt Valid? Required Info Checklist",
  "metaDescription": "A valid receipt needs the seller's name, date, itemized description, amount, tax, total, payment method, and a receipt number. Here's the full checklist.",
  "tldr": "A legally valid receipt must identify the seller, show the transaction date, itemize what was bought, and state the amount, tax, total, and payment method — ideally with a unique receipt number — so it holds up for taxes, reimbursement, and record-keeping.",
  "datePublished": "2026-07-04",
  "dateModified": "2026-07-04",
  "category": "Guides",
  "body": [
    {
      "type": "p",
      "text": "A legally valid receipt is a document that proves a transaction actually happened, and to do that it must show **who sold** (seller name and contact), **when** (the date), **what** (an itemized description of the goods or services), and **how much** (the amount, any tax, and the final total in a stated currency). For strong records it should also note the **payment method** and carry a **unique receipt or transaction number**. There is no single universal government form — a receipt is 'valid' when it contains enough of these elements to reliably substantiate the purchase for taxes, reimbursement, or a dispute."
    },
    {
      "type": "h2",
      "text": "The elements every valid receipt needs"
    },
    {
      "type": "p",
      "text": "Whether it is printed at a register, emailed as a PDF, or reconstructed after the fact, a receipt that will stand up for tax and reimbursement purposes should include the following:"
    },
    {
      "type": "ul",
      "items": [
        "**Seller name and contact** — the business or individual you paid, ideally with an address, phone, email, or website so the seller can be identified and verified.",
        "**Transaction date** — the day the purchase was made (and time, if relevant), which anchors the expense to the correct tax year or reporting period.",
        "**Itemized description** — a line for each product or service, in plain language, so it is clear what the money bought rather than just a lump sum.",
        "**Amount and currency** — the price per line and the subtotal, with the currency stated explicitly (for example USD, EUR, GBP) so there is no ambiguity.",
        "**Tax** — any sales tax, VAT, or GST shown as its own line, ideally with the rate, so the taxable portion is transparent.",
        "**Total** — the final amount actually paid, matching subtotal plus tax minus any discount.",
        "**Payment method** — how it was paid (cash, card, bank transfer, or the last four digits of a card), which ties the receipt to a bank or card statement.",
        "**Receipt or transaction number** — a unique reference so the specific transaction can be looked up, matched, and never counted twice."
      ]
    },
    {
      "type": "h2",
      "text": "Why each element matters"
    },
    {
      "type": "p",
      "text": "These fields are not bureaucratic box-ticking — each one answers a question an accountant, a tax authority, or a reimbursing employer will eventually ask. The seller name and date establish that a real vendor was paid on a real date. The itemized description separates a deductible business expense from a personal one. The tax line lets you reclaim or report tax correctly. And the receipt number plus payment method let anyone reconcile the document against a bank or card statement, which is the single strongest test of authenticity."
    },
    {
      "type": "table",
      "headers": [
        "Element",
        "The question it answers"
      ],
      "rows": [
        [
          "Seller name & contact",
          "Who did I actually pay, and can they be verified?"
        ],
        [
          "Date",
          "Which tax year or reporting period does this belong to?"
        ],
        [
          "Itemized description",
          "Was this a legitimate, deductible purchase?"
        ],
        [
          "Amount & currency",
          "How much was spent, in what money?"
        ],
        [
          "Tax",
          "How much tax can be reported or reclaimed?"
        ],
        [
          "Total",
          "What was the final out-of-pocket cost?"
        ],
        [
          "Payment method",
          "Can this be matched to a statement?"
        ],
        [
          "Receipt number",
          "Is this a unique, traceable transaction?"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Do receipts have to be paper or originals?"
    },
    {
      "type": "p",
      "text": "No. In most jurisdictions a clear digital copy — a PDF, a photo, or a scan — is accepted for tax and reimbursement purposes as long as it is legible and complete, and many tax authorities explicitly allow electronic records. What matters is the information on the receipt, not the medium. That said, a blurry photo with a cut-off total or an unreadable date can be rejected, so keep copies sharp and make sure every required element is visible. For more on this, see [is a photo of a receipt valid](/guides/is-a-photo-of-a-receipt-valid). This is general guidance, not tax or legal advice — rules vary by country and state, so confirm the specifics for your jurisdiction or check with a qualified professional."
    },
    {
      "type": "h2",
      "text": "How to create a valid receipt"
    },
    {
      "type": "p",
      "text": "If you sold something and need to issue a receipt, or you paid for a real purchase and the seller never gave you a proper one, you can produce a clean, complete receipt yourself. The key is to include every element above and to record only true details of a transaction that genuinely happened."
    },
    {
      "type": "ol",
      "items": [
        "Start from a blank [generic receipt template](/receipts/generic) or a category that fits the purchase.",
        "Enter the seller's name and contact details at the top.",
        "Add the transaction date (and time if it matters).",
        "List each item or service on its own line with a short, honest description and price.",
        "Add the tax line and confirm the total equals subtotal plus tax minus any discount.",
        "Record the payment method and a unique receipt number.",
        "Preview it, then download a PDF or PNG for your records."
      ]
    },
    {
      "type": "p",
      "text": "For a deeper walkthrough of wording, formatting, and edge cases, see our guide on [how to write a receipt](/guides/how-to-write-a-receipt)."
    },
    {
      "type": "cta",
      "text": "Build a complete, professional receipt with every required field in a couple of minutes — free, private, and right in your browser.",
      "url": "/create?template=generic",
      "label": "Make a valid receipt"
    },
    {
      "type": "h2",
      "text": "Common reasons a receipt is rejected"
    },
    {
      "type": "ul",
      "items": [
        "**Missing itemization** — a single lump-sum total with no description of what was bought.",
        "**No identifiable seller** — a receipt that does not name the business or provide any way to reach it.",
        "**Illegible or cut-off details** — a faded print or a photo that clips the date, total, or vendor name.",
        "**Mismatched total** — a subtotal, tax, and total that do not add up.",
        "**No proof of payment link** — nothing (payment method or number) that ties the receipt to a statement."
      ]
    },
    {
      "type": "faq",
      "items": [
        {
          "q": "What information should be on a receipt?",
          "a": "At minimum: the seller's name and contact, the transaction date, an itemized description of what was purchased, the amount and currency, any tax, the final total, the payment method, and a unique receipt or transaction number. Those elements let the receipt substantiate the purchase for taxes, reimbursement, and disputes."
        },
        {
          "q": "Is a handwritten receipt legally valid?",
          "a": "Yes. A handwritten receipt is valid as long as it is legible and contains the required elements — seller, date, itemized description, amount, tax, total, and payment details. Legibility and completeness matter far more than whether it was typed or written by hand."
        },
        {
          "q": "Does a valid receipt need a receipt number?",
          "a": "A unique receipt or transaction number is not always strictly mandatory, but it is strongly recommended. It makes each transaction traceable, prevents the same expense from being counted twice, and makes reconciliation against bank or card statements much easier."
        },
        {
          "q": "Is a digital or PDF receipt as valid as a paper one?",
          "a": "In most jurisdictions, yes — a clear digital receipt, scan, or photo is accepted for tax and reimbursement as long as it is legible and includes all the required information. Always keep the copy sharp and complete, and check your local rules, as requirements vary by country and state."
        },
        {
          "q": "What makes a receipt invalid for taxes?",
          "a": "Common problems are missing itemization, no identifiable seller, illegible or cut-off details, a total that doesn't add up, or nothing linking the receipt to how it was paid. Any of these can undermine the receipt as proof of a deductible expense. This is general information, not tax advice — check your jurisdiction or a professional for your situation."
        }
      ]
    },
    {
      "type": "p",
      "text": "Bottom line: a receipt is 'valid' when it carries enough verifiable detail — seller, date, itemized description, amount, tax, total, payment method, and a reference number — to prove a real transaction took place. Get those elements right and your records will hold up for taxes and reimbursement. Reconstructing a receipt for a purchase you genuinely made? Start from the [generic template](/receipts/generic) or [create a receipt](/create) now."
    }
  ],
  "howToSteps": [
    {
      "name": "Choose a template",
      "text": "Start from a blank generic receipt template or a category that fits the purchase."
    },
    {
      "name": "Add seller details",
      "text": "Enter the seller's name and contact details at the top."
    },
    {
      "name": "Add the date",
      "text": "Add the transaction date, and the time if it matters."
    },
    {
      "name": "Itemize the purchase",
      "text": "List each item or service on its own line with a short, honest description and price."
    },
    {
      "name": "Add tax and total",
      "text": "Add the tax line and confirm the total equals subtotal plus tax minus any discount."
    },
    {
      "name": "Record payment and number",
      "text": "Record the payment method and a unique receipt number."
    },
    {
      "name": "Download the receipt",
      "text": "Preview it, then download a PDF or PNG for your records."
    }
  ],
  "relatedGuides": [
    "how-to-write-a-receipt",
    "is-a-photo-of-a-receipt-valid",
    "replacement-receipt-for-taxes"
  ],
  "relatedTemplates": [
    "generic",
    "service",
    "marketplace"
  ]
};
