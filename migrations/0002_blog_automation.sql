-- ReceiptExpenses — blog + automation schema (Cloudflare D1 / SQLite)
-- Apply locally:  npm run db:migrate:local
-- Apply remote:   npm run db:migrate

-- Server-side blog posts. Unlike the old localStorage CMS, these are shared
-- across all visitors, crawlable, and rendered server-side. Auto-generated
-- posts (source='auto') are written by the blog automation job; manual posts
-- can be added the same way.
CREATE TABLE IF NOT EXISTS blog_posts (
  slug       TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  excerpt    TEXT NOT NULL,
  author     TEXT NOT NULL,
  cover      TEXT NOT NULL,             -- emoji
  body       TEXT NOT NULL,             -- JSON array of Block
  date       TEXT NOT NULL,             -- yyyy-mm-dd
  read_mins  INTEGER NOT NULL DEFAULT 1,
  status     TEXT NOT NULL DEFAULT 'published', -- 'draft' | 'published'
  source     TEXT NOT NULL DEFAULT 'auto',      -- 'auto' | 'manual'
  keyword    TEXT,
  created_at INTEGER NOT NULL,          -- unix ms
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_created
  ON blog_posts(status, created_at DESC);

-- Single-row automation configuration (id is pinned to 1). The admin panel
-- writes here; the cron job reads here to decide when to publish next.
CREATE TABLE IF NOT EXISTS blog_automation (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  keywords       TEXT NOT NULL DEFAULT '[]',  -- JSON array of strings
  interval_hours INTEGER NOT NULL DEFAULT 24, -- publish at most one post per N hours
  author         TEXT NOT NULL DEFAULT 'The ReceiptExpenses Team',
  cover          TEXT NOT NULL DEFAULT '📝',
  running        INTEGER NOT NULL DEFAULT 0,  -- 0/1 — is the scheduler active
  cursor         INTEGER NOT NULL DEFAULT 0,  -- index into keywords for round-robin
  last_run_at    INTEGER,                     -- unix ms of last successful publish
  last_keyword   TEXT,
  updated_at     INTEGER NOT NULL DEFAULT 0
);

-- Seed the single config row if it doesn't exist yet.
INSERT OR IGNORE INTO blog_automation (id, updated_at) VALUES (1, 0);
