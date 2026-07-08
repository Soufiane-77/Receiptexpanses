import type { Guide } from "@/lib/guides";

// Cornerstone guide — authored + adversarially compliance-reviewed. Body uses the
// shared Block model (src/lib/blog.ts) and renders via <PostBody>.
export const gigWorker1099Receipts: Guide = {
  "slug": "gig-worker-1099-receipts",
  "title": "Gig Worker & 1099 Contractor Receipts for Tax Season",
  "metaTitle": "Gig Worker & 1099 Receipts: Tax Deduction Records",
  "metaDescription": "How gig workers and 1099 contractors should keep receipts for mileage, phone, supplies, home office, and platform fees — and reconstruct missing ones at tax time.",
  "tldr": "Gig and 1099 workers should keep a dated, itemized receipt for every business expense they plan to deduct — mileage and fuel, phone, supplies, home office, and platform fees — because the burden of proving a deduction falls on you, not the platform that paid you.",
  "datePublished": "2026-07-04",
  "dateModified": "2026-07-04",
  "category": "Taxes",
  "body": [
    {
      "type": "p",
      "text": "Gig and 1099 contractors keep receipts to prove the business expenses they deduct on **Schedule C**, which lowers the self-employment income they owe tax on. As an independent contractor, you are treated as your own business: the platforms that pay you (rideshare, delivery, freelance marketplaces) report your gross earnings, but they do not track your deductible costs — that is on you. A good record is a **dated, itemized receipt** showing what you bought, from whom, how much, and how it relates to your work, kept organized for each tax year. This is general information, not tax or legal advice — rules and thresholds change, so confirm anything specific with a qualified tax professional or your local tax authority."
    },
    {
      "type": "h2",
      "text": "Why 1099 workers need their own receipts"
    },
    {
      "type": "p",
      "text": "When you are a W-2 employee, your employer handles most record-keeping. As a 1099 contractor you are the business, and the general rule is simple: if you want to deduct an expense, you should be able to substantiate it. A platform's year-end summary tells the tax authority what you *earned*; it says little about what you *spent* to earn it. Reconstructing that spending — mileage, fuel, phone, tolls, supplies — is what turns your gross gig income into your (lower) taxable net income."
    },
    {
      "type": "p",
      "text": "Receipts also protect you if your return is ever questioned. A deduction backed by a clear receipt is far easier to defend than one backed by memory. If you are unsure whether a document counts, see our guide on [what makes a receipt valid](/guides/what-makes-a-receipt-valid)."
    },
    {
      "type": "h2",
      "text": "What gig-worker expenses are commonly deductible"
    },
    {
      "type": "p",
      "text": "Deductibility depends on your situation and jurisdiction, but these are the categories gig and 1099 workers most often track. Each generally must be **ordinary and necessary** for your work and, where an expense is part-personal, split to reflect only the business share."
    },
    {
      "type": "table",
      "headers": [
        "Expense category",
        "Typical examples",
        "What to keep"
      ],
      "rows": [
        [
          "Vehicle — mileage or actual costs",
          "Miles driven for deliveries/rides, [fuel](/gas-receipt-generator), tolls, parking, maintenance",
          "Mileage log with dates + purpose, or [fuel receipts](/gas-receipt-generator) and repair invoices if using actual costs"
        ],
        [
          "Phone & data",
          "The business-use share of your cell plan",
          "Monthly carrier bills; note the business-use percentage"
        ],
        [
          "Supplies & equipment",
          "Delivery bags, phone mount, dash cam, cleaning supplies",
          "Itemized purchase receipts"
        ],
        [
          "Home office",
          "A regular, exclusive workspace used for admin/dispatch",
          "Records supporting square footage or the simplified method"
        ],
        [
          "Platform & payment fees",
          "App service fees, commissions, payout/processing fees",
          "Platform statements and fee breakdowns"
        ],
        [
          "Professional costs",
          "Tax prep, accounting apps, business insurance",
          "Invoices and receipts"
        ]
      ]
    },
    {
      "type": "p",
      "text": "For the vehicle category, most gig drivers choose between a **standard mileage rate** and **actual expenses** — you generally cannot mix methods freely once chosen, so pick deliberately and keep the matching records. A contemporaneous mileage log (date, miles, and business purpose) is the backbone either way. Rideshare and delivery drivers can rebuild trip records from a [taxi/rideshare receipt](/taxi-receipt-generator) or an [Uber-style ride receipt](/uber-receipt-generator) when a specific paid trip needs documenting."
    },
    {
      "type": "h2",
      "text": "How to set up a receipt system that survives tax season"
    },
    {
      "type": "ol",
      "items": [
        "**Separate business from personal.** Use a dedicated card or account for gig expenses so business spending is easy to isolate at year-end.",
        "**Capture the receipt the moment you spend.** Photograph paper receipts immediately and file digital ones in one folder — details fade and thermal receipts fade literally.",
        "**Label each expense** with the category and, for shared costs like phone or car, the business-use percentage.",
        "**Keep a running mileage log** with the date, purpose, and miles for every business trip — this is the record drivers most often lose.",
        "**Reconcile monthly**, matching receipts to your bank or card statement so nothing slips through before the year closes.",
        "**Back up your records** in a second location (cloud plus a local copy) so a lost phone doesn't erase a year of deductions."
      ]
    },
    {
      "type": "h2",
      "text": "Reconstructing a receipt you lost"
    },
    {
      "type": "p",
      "text": "It happens: the paper receipt faded, the email vanished, or you simply forgot to save one for a **real** expense you actually paid. For a purchase you can verify from a bank or card statement, you can rebuild a clean, itemized record of that transaction so your files are complete and consistent. [ReceiptExpenses](/create) lets you fill a template with the true details — date, vendor, amount, and line items — and export a tidy PDF for your records."
    },
    {
      "type": "p",
      "text": "Use this only to document genuine purchases you made. Never recreate a receipt to invent an expense you did not incur, to mislead a platform, or to claim a deduction that isn't real — that defeats the purpose and creates real risk. ReceiptExpenses offers brand-*style* templates (for example, an [Uber-style](/uber-receipt-generator) layout for a ride you took or a [fuel](/gas-receipt-generator) layout for gas you bought); it is an independent tool and is not affiliated with, endorsed by, or connected to any of the brands its templates resemble."
    },
    {
      "type": "cta",
      "text": "Rebuild a missing fuel or mileage receipt for a real trip and export a clean PDF for your tax file.",
      "url": "/create/fuel",
      "label": "Make a fuel receipt"
    },
    {
      "type": "h2",
      "text": "Digital vs. paper: does it matter?"
    },
    {
      "type": "p",
      "text": "For most gig workers, a clear digital copy of a receipt is generally acceptable as long as it's legible and complete — which is good news, since thermal receipts fade within months. What matters is that the record is readable, unaltered, and shows the full transaction. Organize scans by tax year and category, and you'll spend far less time hunting come filing season. For more on this, see [is a photo of a receipt valid](/guides/is-a-photo-of-a-receipt-valid)."
    },
    {
      "type": "faq",
      "items": [
        {
          "q": "Do I need receipts if I already have bank or card statements?",
          "a": "Statements help, but they usually aren't enough on their own. A statement shows that money moved and to whom, but not *what* you bought or that it was for business. An itemized receipt establishes the business purpose. Keep both: the statement corroborates the receipt, and the receipt supplies the detail. When in doubt, keep the receipt."
        },
        {
          "q": "How long should a gig worker keep receipts?",
          "a": "A common general guideline is to keep tax records for several years after you file — many people keep at least three to seven years' worth, and some keep them longer for records tied to assets or property. Because retention periods vary by situation and jurisdiction, confirm the exact window with a tax professional and, when unsure, keep records longer rather than shorter."
        },
        {
          "q": "Can I deduct mileage without keeping fuel receipts?",
          "a": "If you use the standard mileage rate, your key record is a contemporaneous mileage log (dates, miles, and business purpose), not fuel receipts. If you instead use the actual-expense method, you'll want the fuel, maintenance, and related receipts. Choose one method and keep the matching records — see our note on the vehicle category above."
        },
        {
          "q": "Are platform fees and commissions deductible?",
          "a": "The service fees, commissions, and payout/processing fees a platform charges you are generally a business cost of earning that income, and gig workers commonly deduct them. Keep the platform's statements showing the fee breakdown so the amounts are documented. Confirm treatment for your specific situation with a tax professional."
        },
        {
          "q": "What if I forgot to save a receipt for a real expense?",
          "a": "For a genuine purchase you can verify from a statement, you can reconstruct a clean, itemized record of that exact transaction so your files are complete. Use accurate details only — a reconstructed record documents a real expense; it should never be used to invent one."
        }
      ]
    },
    {
      "type": "h2",
      "text": "The bottom line"
    },
    {
      "type": "p",
      "text": "Treat your gig work like the small business it is: capture every business receipt, log your miles, split shared costs by their business share, and reconcile monthly. Solid records are what let you claim the deductions you've genuinely earned — and defend them if asked. When a specific deduction, threshold, or retention period matters to your return, check with a qualified tax professional or your local tax authority. And when you're missing a receipt for a real expense, rebuild it accurately with [ReceiptExpenses](/create)."
    }
  ],
  "howToSteps": [
    {
      "name": "Separate business from personal",
      "text": "Use a dedicated card or account for gig expenses so business spending is easy to isolate at year-end."
    },
    {
      "name": "Capture the receipt immediately",
      "text": "Photograph paper receipts the moment you spend and file digital ones in one folder before details fade."
    },
    {
      "name": "Label each expense",
      "text": "Tag every expense with its category and, for shared costs like phone or car, the business-use percentage."
    },
    {
      "name": "Keep a running mileage log",
      "text": "Record the date, purpose, and miles for every business trip as you go."
    },
    {
      "name": "Reconcile monthly",
      "text": "Match receipts to your bank or card statement each month so nothing slips through before the year closes."
    },
    {
      "name": "Back up your records",
      "text": "Store a second copy in the cloud plus a local backup so a lost phone doesn't erase a year of deductions."
    }
  ],
  "relatedGuides": [
    "what-makes-a-receipt-valid",
    "is-a-photo-of-a-receipt-valid",
    "replacement-receipt-for-taxes",
    "do-freelancers-need-receipts"
  ],
  "relatedTemplates": [
    "fuel",
    "taxi",
    "uber"
  ]
};
