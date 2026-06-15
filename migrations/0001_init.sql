-- ReceiptExpenses — initial schema (Cloudflare D1 / SQLite)
-- Apply locally:  npm run db:migrate:local
-- Apply remote:   npm run db:migrate

-- Users: email/password accounts. Passwords are stored as PBKDF2 hashes
-- (salt + derived key are both kept; see src/lib/server/password.ts).
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,             -- uuid
  email         TEXT NOT NULL UNIQUE,         -- stored lowercased
  name          TEXT,
  password_hash TEXT NOT NULL,                -- base64 PBKDF2 derived key
  password_salt TEXT NOT NULL,                -- base64 random salt
  plan          TEXT NOT NULL DEFAULT 'free', -- 'free' | 'pro'
  created_at    INTEGER NOT NULL,             -- unix ms
  updated_at    INTEGER NOT NULL
);

-- Sessions: opaque session id stored in an httpOnly cookie; row is the source
-- of truth and can be revoked by deletion.
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,                -- random token (cookie value)
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,                -- unix ms
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Subscriptions: mirrors Stripe state for the Free/Pro model. One active row
-- per user; updated by the Stripe webhook handler.
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     TEXT PRIMARY KEY,    -- uuid
  user_id                TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  status                 TEXT NOT NULL DEFAULT 'inactive', -- active|trialing|past_due|canceled|inactive
  price_id               TEXT,
  current_period_end     INTEGER,             -- unix ms
  created_at             INTEGER NOT NULL,
  updated_at             INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
