export const meta = {
  name: 'aeo-cornerstone-guides',
  description: 'Author 10 AEO/GEO cornerstone guide pages for ReceiptExpenses, each adversarially compliance-checked',
  phases: [
    { title: 'Author', detail: 'one expert content agent per guide' },
    { title: 'Verify', detail: 'adversarial compliance + quality + schema-match review per guide' },
  ],
}

// ---- Shared context handed to every agent ----------------------------------
const PRODUCT = `
ReceiptExpenses (https://receiptexpenses.com) is a free, private, browser-based receipt & invoice
maker. Pick from 24+ templates (Business, Retail, Food & Drink, Travel, Services — including
brand-STYLE templates like Walmart, Amazon, Uber, Apple, Nike, Jordan, Airbnb, Starbucks),
fill a live form, preview in real time, and download a pixel-perfect PDF/PNG or print. 100%
client-side — receipt content never leaves the browser. Building & previewing need no account;
downloading/printing/saving need only a FREE account (email or Google). No paid tier currently.
The receipt editor lives at /create (deep-link a template with /create/<id>). Each template
also has a keyword landing page at a top-level slug like /apple-receipt-generator (see the
TEMPLATE LINK MAP). Other pages: /receipts (all types), /guides, /faq, /about, /blogs.
`.trim()

const TEMPLATE_IDS = `
generic, service, marketplace (online order), restaurant, cafe, thermal, grocery, bigbox,
fuel, taxi, parking, hotel, vacation-rental, pharmacy, electronics, airbnb, walmart, amazon,
uber, starbucks, nike, adidas, apple, jordan
`.trim()

// TEMPLATE LINK MAP — canonical internal-link URLs per template. For in-body
// cross-links use the LANDING page; for a CTA use the EDITOR path. NEVER emit
// the legacy /receipts/<id> or /create?template=<id> forms (they only redirect).
const TEMPLATE_LINKS = `
TEMPLATE LINK MAP (in-body cross-link → landing page; CTA → editor path):
- generic → landing /sales-receipt-generator, editor /create/generic
- service → landing /service-receipt-generator, editor /create/service
- marketplace → landing /online-order-receipt-generator, editor /create/marketplace
- restaurant → landing /restaurant-receipt-generator, editor /create/restaurant
- cafe → landing /coffee-shop-receipt-generator, editor /create/cafe
- thermal → landing /pos-receipt-generator, editor /create/thermal
- grocery → landing /grocery-receipt-generator, editor /create/grocery
- bigbox → landing /superstore-receipt-generator, editor /create/bigbox
- fuel → landing /gas-receipt-generator, editor /create/fuel
- taxi → landing /taxi-receipt-generator, editor /create/taxi
- parking → landing /parking-receipt-generator, editor /create/parking
- hotel → landing /hotel-receipt-generator, editor /create/hotel
- vacation-rental → landing /vacation-rental-receipt-generator, editor /create/vacation-rental
- pharmacy → landing /pharmacy-receipt-generator, editor /create/pharmacy
- electronics → landing /electronics-receipt-generator, editor /create/electronics
- airbnb → landing /airbnb-receipt-generator, editor /create/airbnb
- walmart → landing /walmart-receipt-generator, editor /create/walmart
- amazon → landing /amazon-receipt-generator, editor /create/amazon
- uber → landing /uber-receipt-generator, editor /create/uber
- starbucks → landing /starbucks-receipt-generator, editor /create/starbucks
- nike → landing /nike-receipt-generator, editor /create/nike
- adidas → landing /adidas-receipt-generator, editor /create/adidas
- apple → landing /apple-receipt-generator, editor /create/apple
- jordan → landing /jordan-receipt-generator, editor /create/jordan
`.trim()

const GUIDE_SLUGS = `
receipt-vs-invoice, how-to-write-a-receipt, replacement-receipt-for-taxes,
lost-uber-lyft-receipt, rent-receipt-requirements-by-state, gig-worker-1099-receipts,
what-makes-a-receipt-valid, is-a-photo-of-a-receipt-valid, do-freelancers-need-receipts,
track-tech-hardware-expenses
`.trim()

const GUARDRAILS = `
HARD GUARDRAILS (a violation fails the guide):
- NEVER fabricate statistics, study citations, dollar figures presented as fact, AggregateRating,
  reviews, testimonials, or "X% of users" claims. If you don't have a real, verifiable fact, speak
  generally ("many freelancers…") — never invent a number or cite a source you can't name.
- Tax/legal content must be GENERAL and accurate, and must include a light "not tax/legal advice,
  check your jurisdiction / a professional" note where it gives tax guidance. Do NOT state hard
  IRS thresholds as if guaranteed current unless they are long-stable and clearly framed as general.
- For ANY brand mention (Apple, Uber, Nike, etc.): frame STRICTLY around legitimate expense
  tracking, tax-deduction record-keeping, reimbursement, and reconstructing a receipt for a REAL
  purchase the user actually made. NEVER frame around: fake receipts, fooling a retailer, returns
  fraud, warranty fraud, resale authentication to deceive, or impersonating the brand. Always note
  ReceiptExpenses is independent / not affiliated when a brand is named prominently.
- No placeholder / lorem / TODO. Every sentence must be real, complete, publishable copy.
`.trim()

// Block model the site renders (must match src/lib/blog.ts Block union exactly).
const BLOCK_SPEC = `
The "body" is an array of Block objects. Allowed block shapes ONLY:
  {"type":"p","text":"..."}                              paragraph (supports inline markdown)
  {"type":"h2","text":"..."}                             section heading
  {"type":"h3","text":"..."}                             sub-heading
  {"type":"ul","items":["...","..."]}                    bullet list
  {"type":"ol","items":["...","..."]}                    numbered list
  {"type":"table","headers":["A","B"],"rows":[["1","2"]]} comparison table
  {"type":"cta","text":"...","url":"/create/generic","label":"Make a receipt"}
  {"type":"faq","items":[{"q":"...","a":"..."}]}         FAQ block (harvested into FAQPage schema)
Inline markdown INSIDE any text/items/cell: [anchor](/uber-receipt-generator) for internal links and
**bold**. Use internal links liberally to the template LANDING pages and /create/<id> editor
paths in the TEMPLATE LINK MAP (never the legacy /receipts/<id> or /create?template=<id> forms).
Do NOT use "image" blocks (we have no real images for these). Do NOT invent other block types.
The FIRST block MUST be a {"type":"p"} that is a complete, self-contained, definition-first answer
to the page's core question (answer-first / GEO best practice).
`.trim()

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'title', 'metaTitle', 'metaDescription', 'tldr', 'category', 'body', 'relatedTemplates', 'relatedGuides'],
  properties: {
    slug: { type: 'string' },
    title: { type: 'string', description: 'H1, may be longer/descriptive' },
    metaTitle: { type: 'string', description: '<title>, <= ~60 chars, question-shaped where natural' },
    metaDescription: { type: 'string', description: '<= ~155 chars, compelling, contains the primary keyword' },
    tldr: { type: 'string', description: 'One self-contained sentence answering the core question; the TL;DR callout' },
    category: { type: 'string', enum: ['Guides', 'Comparisons', 'Templates', 'Taxes'] },
    body: {
      type: 'array',
      items: { type: 'object', additionalProperties: true, required: ['type'], properties: { type: { type: 'string' } } },
      minItems: 6,
    },
    howToSteps: {
      type: 'array',
      description: 'ONLY include when the body contains a real numbered ol procedure; each step mirrors that on-page text. Omit or empty otherwise.',
      items: {
        type: 'object', additionalProperties: false, required: ['name', 'text'],
        properties: { name: { type: 'string' }, text: { type: 'string' } },
      },
    },
    relatedTemplates: { type: 'array', items: { type: 'string' }, description: 'template ids to cross-link' },
    relatedGuides: { type: 'array', items: { type: 'string' }, description: 'other guide slugs from the set to cross-link' },
  },
}

const GUIDES = [
  {
    slug: 'receipt-vs-invoice',
    brief: `"Receipt vs. Invoice: What's the Difference?" A comparison pillar. MUST include a {"type":"table"}
    block contrasting receipt vs invoice across: purpose, when issued (before vs after payment),
    what it proves, typical fields, and who needs it. Definition-first opening defines both terms in
    one paragraph. Target queries: "receipt vs invoice", "difference between invoice and receipt".
    Category "Comparisons". Cross-link /service-receipt-generator and /sales-receipt-generator. No HowTo.`,
  },
  {
    slug: 'how-to-write-a-receipt',
    brief: `"How to Write a Receipt for Your Small Business (Free Template)". MUST contain a real numbered
    {"type":"ol"} of the steps to write a valid receipt (date, seller, buyer, itemized lines,
    subtotal/tax/total, payment method, receipt number), and populate howToSteps to mirror that ol
    exactly. Definition-first opening. Category "Guides". Strong CTA to /create. Cross-link
    /sales-receipt-generator, /service-receipt-generator. Targets: "how to write a receipt", "small business receipt template".`,
  },
  {
    slug: 'replacement-receipt-for-taxes',
    brief: `"How to Get a Replacement Receipt for Tax & Expense Reimbursement (Apple, Amazon, Best Buy)".
    Explain how a small business / freelancer can LAWFULLY document a hardware/tech expense when the
    ORIGINAL receipt is lost — reconstructing an accurate record of a real purchase (bank/card
    statement + reconstructed receipt), NOT fabricating a purchase. Category "Taxes". Include a
    numbered ol of how to reconstruct a lost receipt properly + howToSteps. Brand mentions must be
    safe per guardrails. Cross-link /apple-receipt-generator, /amazon-receipt-generator, /electronics-receipt-generator and the
    guide track-tech-hardware-expenses. Targets: "lost receipt for taxes", "replacement receipt".`,
  },
  {
    slug: 'lost-uber-lyft-receipt',
    brief: `"Rideshare Expense Tracking: How to Handle a Lost Uber or Lyft Receipt". How to retrieve or
    reconstruct a rideshare receipt for a ride you actually took, for work-travel reimbursement or a
    mileage/transport deduction. Note the legit first step is checking the app's trip history/email;
    reconstruction is for when that's unavailable. Category "Taxes". Cross-link /uber-receipt-generator,
    /taxi-receipt-generator. Include an faq block. Targets: "lost uber receipt for work",
    "how to get rideshare receipts for taxes".`,
  },
  {
    slug: 'rent-receipt-requirements-by-state',
    brief: `"Rent Receipt Template & Requirements by State". Cover which US states have explicit
    tenant-can-request-a-rent-receipt rules. Be ACCURATE and general — only state a rule if it is a
    well-established statutory right; if unsure, describe the general pattern rather than inventing a
    citation. MUST include a {"type":"table"} of representative states and their rent-receipt rule
    (e.g. Maryland, Massachusetts, New York, Washington — describe generally, note "verify current
    local law"). Include a numbered ol of what a rent receipt must contain + howToSteps. Include the
    "not legal advice, verify local law" note. Category "Guides". Cross-link /sales-receipt-generator,
    /service-receipt-generator. Targets: "rent receipt template", "rent receipt requirements".`,
  },
  {
    slug: 'gig-worker-1099-receipts',
    brief: `"Gig Worker & 1099 Contractor Receipts for Tax Season". How gig/1099 workers should keep
    receipts for deductible expenses (mileage/fuel, phone, supplies, home office, platform fees).
    General tax framing + "not tax advice, consult a professional" note. Category "Taxes". Include an
    faq block (e.g. "Do I need receipts if I have bank statements?", "How long to keep receipts?").
    Cross-link /gas-receipt-generator, /taxi-receipt-generator, /uber-receipt-generator and guide what-makes-a-receipt-valid.
    Targets: "gig worker tax deduction receipts", "1099 expense tracking".`,
  },
  {
    slug: 'what-makes-a-receipt-valid',
    brief: `"What Has to Be on a Legally Valid Receipt". Definition-first: list the elements a receipt
    needs to be useful for tax/reimbursement (seller name & contact, date, itemized description,
    amount & currency, tax, total, payment method, receipt number). MUST include a {"type":"ul"} or
    ol of the required elements. Category "Guides". Include an faq block. Cross-link /sales-receipt-generator
    and guide how-to-write-a-receipt. Targets: "what information should be on a receipt",
    "legal receipt requirements".`,
  },
  {
    slug: 'is-a-photo-of-a-receipt-valid',
    brief: `"Is a Photo or Screenshot of a Receipt Valid for Taxes or Reimbursement?" Direct-answer page:
    lead with a clear yes/generally-yes answer (the IRS and most employers accept legible digital
    copies/scans if they capture all required info), with the "keep it legible & complete, verify
    your employer's/jurisdiction's policy, not tax advice" caveats. Category "Taxes". MUST include an
    faq block. Cross-link guide what-makes-a-receipt-valid. Targets: "is a photo of a receipt valid",
    "digital receipts for taxes".`,
  },
  {
    slug: 'do-freelancers-need-receipts',
    brief: `"Do Freelancers Need to Give Clients a Receipt?" Direct-answer: distinguish invoice (request
    for payment) vs receipt (proof payment was made), when a client can request a receipt, and why
    issuing one is good practice. Category "Guides". MUST include an faq block. Cross-link
    /service-receipt-generator, /create/service and guide receipt-vs-invoice. Targets:
    "freelancer receipt requirements", "invoice vs receipt for freelancers".`,
  },
  {
    slug: 'track-tech-hardware-expenses',
    brief: `"How to Track Tech & Hardware Expenses for 1099 Taxes". For freelancers/contractors buying
    computers, phones, cameras: how to document hardware purchases, keep receipts, and the general
    idea of deducting/depreciating business equipment (general, "consult a tax pro" caveat; mention
    Section 179 only in general terms, not as guaranteed specifics). Category "Taxes". Cross-link
    /apple-receipt-generator, /electronics-receipt-generator and guide replacement-receipt-for-taxes. Include an faq
    block. Targets: "track hardware expenses 1099", "deduct computer for business".`,
  },
]

// ---- Run: author each guide, then adversarially verify each ----------------
phase('Author')
const results = await pipeline(
  GUIDES,
  (g) =>
    agent(
      `You are a senior SEO/GEO content writer and small-business accounting expert. Write ONE
cornerstone guide page for ReceiptExpenses as validated JSON matching the output schema.

PRODUCT CONTEXT:
${PRODUCT}

Valid template ids: ${TEMPLATE_IDS}
Internal-link URLs to use (landing page for in-body links, editor path for CTAs):
${TEMPLATE_LINKS}

Other guide slugs in this set (cross-link a few via /guides/<slug>):
${GUIDE_SLUGS}

${GUARDRAILS}

${BLOCK_SPEC}

WRITING STYLE FOR ANSWER ENGINES (GEO/AEO):
- First body block = a complete, standalone, definition-first answer (2–4 sentences).
- One idea per H2 section; use ol for any sequence of steps; use a table where comparing things.
- Include at least one {"type":"faq"} block with 3–5 real Q&As targeting long-tail queries.
- Include one {"type":"cta"} block pointing to the most relevant /create/<id>.
- ~700–1100 words of substantive copy. Natural keyword use, no stuffing.
- Set the slug field to EXACTLY "${g.slug}".

THIS GUIDE:
slug: ${g.slug}
${g.brief}

Return ONLY the JSON object.`,
      { label: `author:${g.slug}`, phase: 'Author', schema: SCHEMA, effort: 'high' }
    ),
  (draft, g) => {
    if (!draft) return null
    return agent(
      `You are an adversarial editor and compliance reviewer for ReceiptExpenses. Scrutinize this
DRAFT guide JSON (slug ${g.slug}). Return the corrected/approved guide JSON (same schema).

Check and FIX every issue:
1. GUARDRAILS — reject/rewrite any fabricated stat, invented citation, fake number, or any brand
   framing that drifts toward fraud/deception/returns/warranty/impersonation. Ensure brand mentions
   are strictly legitimate-expense-framed and note independence/not-affiliated where a brand is
   prominent. Ensure tax/legal content carries a light "not advice / verify jurisdiction" note where
   it gives guidance.
   ${GUARDRAILS}
2. SCHEMA-MATCH — if howToSteps is present, the body MUST contain a matching numbered ol whose
   steps say the same thing (Google HowTo requirement). If there is no such ol, either add one that
   fits naturally OR drop howToSteps. If the brief said the page MUST include a table/ol/faq, ensure
   it is present.
3. QUALITY — first block is a genuine definition-first answer; every block type is valid per the
   spec; internal links use ONLY the canonical URLs from the TEMPLATE LINK MAP (${TEMPLATE_LINKS})
   — landing pages like /apple-receipt-generator or editor paths like /create/apple, NEVER legacy
   /receipts/<id> or /create?template=<id> — plus /guides/<slug> from this set
   (${GUIDE_SLUGS}) or /create; no lorem/TODO; complete publishable copy; ~700+ words.
4. slug must equal "${g.slug}".

BLOCK SPEC (valid shapes):
${BLOCK_SPEC}

DRAFT:
${JSON.stringify(draft)}

Return ONLY the corrected JSON object (full guide, not a diff).`,
      { label: `verify:${g.slug}`, phase: 'Verify', schema: SCHEMA, effort: 'high' }
    )
  }
)

const guides = results.filter(Boolean)
log(`Authored + verified ${guides.length}/${GUIDES.length} guides`)
return { guides }
