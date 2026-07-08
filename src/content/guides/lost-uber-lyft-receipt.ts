import type { Guide } from "@/lib/guides";

// Cornerstone guide — authored + adversarially compliance-reviewed. Body uses the
// shared Block model (src/lib/blog.ts) and renders via <PostBody>.
export const lostUberLyftReceipt: Guide = {
  "slug": "lost-uber-lyft-receipt",
  "title": "Rideshare Expense Tracking: How to Handle a Lost Uber or Lyft Receipt",
  "metaTitle": "Lost Uber or Lyft Receipt? How to Get One for Taxes",
  "metaDescription": "Lost an Uber or Lyft receipt for a work trip? Here's how to retrieve it from the app, request it by email, or reconstruct a record for a ride you actually took.",
  "tldr": "To recover a lost rideshare receipt, first open the Uber or Lyft app and pull the receipt from your trip history or resend it by email; only if that fails should you reconstruct a record from your bank statement for a ride you actually took.",
  "datePublished": "2026-07-04",
  "dateModified": "2026-07-04",
  "category": "Taxes",
  "body": [
    {
      "type": "p",
      "text": "If you lost an Uber or Lyft receipt for a ride you actually took, your first and best step is to retrieve the original: open the app, go to your trip history, tap the specific ride, and either view or re-send the receipt to your email. Both platforms store every completed trip, so a 'lost' receipt is almost always still recoverable. Only when a receipt genuinely cannot be retrieved should you reconstruct a clean record from your card statement and trip details, so you have documentation for a work-travel reimbursement or a transport deduction."
    },
    {
      "type": "h2",
      "text": "Step 1: Retrieve the original receipt from the app"
    },
    {
      "type": "p",
      "text": "Rideshare apps keep a permanent, itemized history of every completed trip. In almost every case the receipt you thought you lost is sitting in your account right now. This is the legitimate first move, and it gives you the strongest possible record because it is the platform's own document."
    },
    {
      "type": "ol",
      "items": [
        "**Uber:** Open the app, tap **Account** then **Trips** (or **Activity**), select the ride, and choose **Receipt**. Tap **Resend receipt** to email a fresh copy to yourself.",
        "**Lyft:** Open the app, tap the menu, then **Ride history**, pick the trip, and select **Send receipt** or **Get help**. You can also review past rides at the Lyft website when signed in.",
        "**Search your email:** Both services email a receipt automatically after each ride. Search your inbox for 'Uber' or 'Lyft' plus the date. The original PDF or HTML receipt is usually already there.",
        "**Web dashboard:** Uber's business and rider portals let you download receipts and monthly trip statements in bulk, which is ideal at tax time."
      ]
    },
    {
      "type": "p",
      "text": "If you booked the ride through an employer travel program or a corporate account, the receipt may also live in that system, so check there before assuming it is gone."
    },
    {
      "type": "h2",
      "text": "Step 2: When the receipt truly can't be retrieved"
    },
    {
      "type": "p",
      "text": "Occasionally the original is unavailable, for example an old ride outside the app's visible history, a closed or merged account, or a trip a colleague booked on your behalf. When you have exhausted the retrieval options above but you genuinely took the ride and it is a legitimate business expense, you can reconstruct a substitute record from the evidence you do have. This is about documenting a real purchase, not inventing one."
    },
    {
      "type": "p",
      "text": "Pull together every trace of the ride: the charge on your bank or card statement (which shows the exact amount, date, and merchant), any partial email, your calendar entry for the meeting or airport trip, and your own memory of the route. Those pieces establish that the expense was real."
    },
    {
      "type": "h3",
      "text": "Reconstruct a clean record you can file"
    },
    {
      "type": "p",
      "text": "With those details in hand, you can generate a tidy, human-readable receipt to attach to your expense report or tax folder. A [rideshare-style receipt template](/uber-receipt-generator) or a general [taxi receipt](/taxi-receipt-generator) lets you record the fare, date, pickup and drop-off, and total in a consistent format. Build and preview it free in the [receipt editor](/create/uber); ReceiptExpenses is an independent tool and is not affiliated with, endorsed by, or connected to Uber, Lyft, or any rideshare company."
    },
    {
      "type": "p",
      "text": "Fill in only the true figures from your statement and trip. The goal is to turn scattered evidence into one clean document that a bookkeeper, employer, or tax professional can read at a glance, not to create a record of a ride that did not happen."
    },
    {
      "type": "cta",
      "text": "Reconstruct a receipt for a rideshare trip you actually took, using the real amount from your statement.",
      "url": "/create/uber",
      "label": "Make a rideshare receipt"
    },
    {
      "type": "h2",
      "text": "What a rideshare expense record should contain"
    },
    {
      "type": "p",
      "text": "Whether you retrieved the original or rebuilt one, a record that holds up for reimbursement or a deduction generally includes the same core fields. Keeping these consistent across every trip makes your whole expense log easier to defend."
    },
    {
      "type": "table",
      "headers": [
        "Field",
        "Why it matters"
      ],
      "rows": [
        [
          "Date and time",
          "Ties the trip to a specific business purpose (meeting, airport, client visit)"
        ],
        [
          "Amount and currency",
          "The actual total charged, matching your bank statement to the cent"
        ],
        [
          "Pickup and drop-off",
          "Shows the route was business-related, not personal"
        ],
        [
          "Service provider",
          "Uber, Lyft, or a local taxi — identifies the vendor"
        ],
        [
          "Business purpose",
          "A short note on why the ride was necessary for work"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Rideshare receipts vs. the mileage deduction"
    },
    {
      "type": "p",
      "text": "A common point of confusion: the standard mileage deduction is for miles you drive in **your own vehicle** for business. When you pay Uber or Lyft, you are not driving, so that fare is instead a **transportation** or **travel** expense, deducted as its actual cost. You keep the receipt, not a mileage log. If you drive for a rideshare platform yourself as a gig worker, that is a different situation covered in our [gig-worker 1099 receipts guide](/guides/gig-worker-1099-receipts)."
    },
    {
      "type": "p",
      "text": "This is general information, not tax or legal advice. Deduction rules and documentation standards vary by country, state, and your specific situation, so confirm what applies to you with a qualified tax professional or your local tax authority before you file."
    },
    {
      "type": "faq",
      "items": [
        {
          "q": "How do I get an Uber receipt for taxes after losing it?",
          "a": "Open the Uber app, go to Trips or Activity, select the ride, tap Receipt, and choose Resend receipt to email yourself a copy. For many trips at once, download a trip statement from Uber's web dashboard. Search your email for 'Uber' plus the date too, since a receipt is sent automatically after every ride."
        },
        {
          "q": "Can I still deduct a work Uber ride if I lost the receipt entirely?",
          "a": "If you truly can't retrieve the original, your bank or card statement showing the charge, combined with your calendar and trip notes, is supporting evidence that the expense was real. You can compile those into a clean reconstructed record. Rules on what counts as adequate documentation vary, so check with a tax professional for your jurisdiction."
        },
        {
          "q": "Is a rideshare fare a mileage deduction or a travel expense?",
          "a": "When you pay for an Uber or Lyft, you are a passenger, not the driver, so the fare is a transportation or travel expense deducted at its actual cost, not a per-mile mileage deduction. Mileage applies to miles you drive in your own car for business."
        },
        {
          "q": "Do I need a separate receipt for every single rideshare trip?",
          "a": "For reimbursement and tax records, per-trip documentation is the cleanest approach because each ride has its own date, amount, and business purpose. Uber and Lyft can also provide monthly trip statements that bundle many rides together, which is handy for high-volume travelers."
        },
        {
          "q": "Is it okay to recreate a rideshare receipt myself?",
          "a": "Yes, as long as it documents a ride you genuinely took and uses the true amount from your statement. Reconstructing a clean, readable record of a real expense is legitimate record-keeping. Creating a receipt for a ride that never happened is not, and you should never use a receipt tool that way."
        }
      ]
    }
  ],
  "relatedGuides": [
    "gig-worker-1099-receipts",
    "replacement-receipt-for-taxes",
    "what-makes-a-receipt-valid"
  ],
  "relatedTemplates": [
    "uber",
    "taxi"
  ]
};
