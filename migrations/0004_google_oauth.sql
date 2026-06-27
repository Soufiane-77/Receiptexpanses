-- ReceiptExpenses — Google (OAuth) sign-in support.
-- Apply locally:  npm run db:migrate:local
-- Apply remote:   npm run db:migrate
--
-- Additive, non-destructive migration: it only ADDs columns + an index, so it
-- is safe to run on the live database without rebuilding the users table.
--
-- OAuth-only accounts are created with empty password_hash/password_salt
-- (the columns are NOT NULL); password login is rejected for such rows in
-- verifyCredentials(). Existing email/password accounts keep working unchanged
-- and can additionally link a Google identity (matched by email).

ALTER TABLE users ADD COLUMN google_id     TEXT;                       -- Google "sub" (stable user id), NULL for email-only accounts
ALTER TABLE users ADD COLUMN avatar_url    TEXT;                       -- Google profile picture URL, if any
ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'email'; -- 'email' | 'google'

-- One account per Google identity. SQLite treats multiple NULLs as distinct,
-- so email-only rows (google_id IS NULL) don't collide.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
