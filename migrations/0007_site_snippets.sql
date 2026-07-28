-- Admin-managed custom code snippets (analytics tags, pixels, verification
-- meta, custom styles) injected into every public page.
--
-- SECURITY: this stores raw HTML that is executed in every visitor's browser.
-- The write path (/api/admin/snippets) is gated by BLOG_ADMIN_TOKEN — never by
-- the client-side admin password, which is only a soft gate. Treat write access
-- to this table as equivalent to full control of the site.
--
-- Apply locally:  npm run db:migrate:local
-- Apply remote:   npm run db:migrate

CREATE TABLE IF NOT EXISTS site_snippets (
  id         INTEGER PRIMARY KEY CHECK (id = 1),  -- singleton row
  enabled    INTEGER NOT NULL DEFAULT 0,          -- master on/off, default OFF (safe)
  head_html  TEXT    NOT NULL DEFAULT '',         -- injected into <head>
  body_html  TEXT    NOT NULL DEFAULT '',         -- injected at end of <body>
  updated_at INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO site_snippets (id, enabled, head_html, body_html, updated_at)
VALUES (1, 0, '', '', 0);
