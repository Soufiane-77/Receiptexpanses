-- Cookieless first-party referral analytics. One row per landing hit, so
-- AI-answer-engine referrals (ChatGPT, Claude, Perplexity, Gemini, Copilot…)
-- are visible without any third-party analytics tag or consent-triggering
-- cookie. No PII: we store the referrer host, a source key/medium, the landing
-- path, and a coarse day bucket — never the full IP or a user identifier.

CREATE TABLE IF NOT EXISTS referral_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  day          TEXT    NOT NULL,               -- YYYY-MM-DD bucket for rollups
  source       TEXT    NOT NULL,               -- e.g. 'chatgpt', 'google', 'direct'
  label        TEXT    NOT NULL,               -- e.g. 'ChatGPT'
  medium       TEXT    NOT NULL,               -- 'ai' | 'search' | 'social' | 'referral' | 'direct'
  is_ai        INTEGER NOT NULL DEFAULT 0,     -- 1 when an AI answer engine
  referrer_host TEXT,                          -- hostname only, never full URL/query
  landing_path TEXT                            -- path only, no query string
);

CREATE INDEX IF NOT EXISTS idx_referral_events_day ON referral_events (day);
CREATE INDEX IF NOT EXISTS idx_referral_events_source ON referral_events (source);
CREATE INDEX IF NOT EXISTS idx_referral_events_ai ON referral_events (is_ai);
