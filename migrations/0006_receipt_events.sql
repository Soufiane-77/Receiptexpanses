-- Receipt generation analytics — METADATA ONLY.
--
-- IMPORTANT (privacy contract): ReceiptExpenses promises publicly that receipt
-- content never leaves the browser (see /privacy, /faq, llms.txt, JSON-LD
-- featureList). This table therefore stores ONLY *that* a receipt was made and
-- with which template — never the business name, line items, logo, amounts or
-- any other receipt field. Do not add content columns here without first
-- updating every public privacy claim on the site.
--
-- Apply locally:  npm run db:migrate:local
-- Apply remote:   npm run db:migrate

CREATE TABLE IF NOT EXISTS receipt_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  day         TEXT    NOT NULL,          -- YYYY-MM-DD bucket for rollups
  template_id TEXT    NOT NULL,          -- e.g. 'apple' (registry id)
  action      TEXT    NOT NULL,          -- 'pdf' | 'png' | 'print' | 'save'
  user_id     TEXT,                      -- Supabase user id; NULL when signed out
  user_email  TEXT                       -- denormalized for the admin list; NULL when signed out
);

CREATE INDEX IF NOT EXISTS idx_receipt_events_day ON receipt_events (day);
CREATE INDEX IF NOT EXISTS idx_receipt_events_template ON receipt_events (template_id);
CREATE INDEX IF NOT EXISTS idx_receipt_events_user ON receipt_events (user_id);
