-- ReceiptExpenses — Autopilot Blog engine (Cloudflare D1 / SQLite)
-- Apply locally:  npm run db:migrate:local
-- Apply remote:   npm run db:migrate
--
-- Supersedes the simple round-robin automation (blog_automation) with a
-- keyword QUEUE (blog_keywords), a richer per-post SEO/GEO schema (extra
-- blog_posts columns), and a single-row global config (blog_settings).

-- 1) Keyword queue ----------------------------------------------------------
-- One row per keyword the admin enqueues. The scheduler pops the next
-- 'queued' row, runs the generation pipeline, and records the outcome.
CREATE TABLE IF NOT EXISTS blog_keywords (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'queued', -- queued|processing|published|failed|skipped_duplicate
  priority     INTEGER NOT NULL DEFAULT 0,     -- higher = sooner
  created_at   INTEGER NOT NULL,               -- unix ms
  processed_at INTEGER,                         -- unix ms
  error        TEXT,
  post_slug    TEXT                             -- -> blog_posts.slug when published
);
CREATE INDEX IF NOT EXISTS idx_blog_keywords_status
  ON blog_keywords(status, priority DESC, created_at ASC);

-- 2) Extend blog_posts with SEO/GEO + autopilot fields ----------------------
-- (read_mins already exists and serves as reading_time.)
ALTER TABLE blog_posts ADD COLUMN meta_title          TEXT;
ALTER TABLE blog_posts ADD COLUMN meta_description     TEXT;
ALTER TABLE blog_posts ADD COLUMN cover_image_url      TEXT;
ALTER TABLE blog_posts ADD COLUMN cover_image_alt      TEXT;
ALTER TABLE blog_posts ADD COLUMN word_count           INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN schema_json          TEXT;             -- JSON-LD (Article+FAQ+Breadcrumb)
ALTER TABLE blog_posts ADD COLUMN target_keyword       TEXT;
ALTER TABLE blog_posts ADD COLUMN secondary_keywords   TEXT NOT NULL DEFAULT '[]';  -- JSON string[]
ALTER TABLE blog_posts ADD COLUMN internal_links       TEXT NOT NULL DEFAULT '[]';  -- JSON {slug,anchor}[]
ALTER TABLE blog_posts ADD COLUMN published_at         INTEGER;          -- unix ms
ALTER TABLE blog_posts ADD COLUMN indexed_at           INTEGER;          -- unix ms (first submit)
ALTER TABLE blog_posts ADD COLUMN index_status         TEXT NOT NULL DEFAULT '{}';  -- JSON per-engine result

-- 3) Single-row global config (id pinned to 1) ------------------------------
CREATE TABLE IF NOT EXISTS blog_settings (
  id                     INTEGER PRIMARY KEY CHECK (id = 1),
  -- autopilot behaviour
  auto_publish           INTEGER NOT NULL DEFAULT 0,   -- 0 = save as draft (safe default), 1 = publish live
  running                INTEGER NOT NULL DEFAULT 0,   -- master scheduler on/off
  interval_hours         INTEGER NOT NULL DEFAULT 24,  -- min hours between posts
  daily_cap              INTEGER NOT NULL DEFAULT 2,   -- max posts per calendar day
  min_spacing_minutes    INTEGER NOT NULL DEFAULT 60,  -- min minutes between two posts
  -- content config
  author                 TEXT NOT NULL DEFAULT 'The ReceiptExpenses Team',
  cover                  TEXT NOT NULL DEFAULT '📝',    -- emoji fallback when no cover image
  brand_voice            TEXT NOT NULL DEFAULT 'Friendly, concrete and practical. Speak to small-business owners and freelancers. No fluff, no hype, no keyword stuffing.',
  model                  TEXT NOT NULL DEFAULT '@cf/meta/llama-3.1-8b-instruct-fp8',
  min_word_count         INTEGER NOT NULL DEFAULT 600,  -- quality floor; below this -> failed/flagged
  internal_link_density  INTEGER NOT NULL DEFAULT 3,    -- target internal links per post
  -- CTA
  cta_text               TEXT NOT NULL DEFAULT 'Create a professional receipt in under a minute — free to preview.',
  cta_url                TEXT NOT NULL DEFAULT '/create',
  cta_label              TEXT NOT NULL DEFAULT 'Start creating',
  -- indexing
  enable_indexnow        INTEGER NOT NULL DEFAULT 1,   -- Bing/Yandex/Naver/Seznam (Google NOT supported)
  enable_google_indexing INTEGER NOT NULL DEFAULT 0,   -- default OFF (Google restricts this API)
  indexnow_key           TEXT,                          -- 32-char hex; generated on first use
  google_sa_json         TEXT,                          -- service-account JSON (only if Google toggle on)
  -- bookkeeping
  last_run_at            INTEGER,
  published_today        INTEGER NOT NULL DEFAULT 0,
  published_today_date   TEXT,                          -- yyyy-mm-dd; resets the daily counter
  updated_at             INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO blog_settings (id, updated_at) VALUES (1, 0);

-- 4) Retire the old round-robin config --------------------------------------
DROP TABLE IF EXISTS blog_automation;
