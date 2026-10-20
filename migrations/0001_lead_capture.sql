-- New namespace intentionally leaves the pre-existing legacy `leads` table untouched.
CREATE TABLE IF NOT EXISTS drainage_leads (
 id TEXT PRIMARY KEY,
 created_at INTEGER NOT NULL,
 payload TEXT NOT NULL,
 photos TEXT NOT NULL DEFAULT '[]',
 fingerprint TEXT NOT NULL,
 admin_sent INTEGER NOT NULL DEFAULT 0 CHECK(admin_sent IN (0,1)),
 customer_sent INTEGER NOT NULL DEFAULT 0 CHECK(customer_sent IN (0,1)),
 attempts INTEGER NOT NULL DEFAULT 0,
 next_attempt INTEGER NOT NULL DEFAULT 0,
 lease_until INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS drainage_leads_outbox ON drainage_leads(next_attempt,lease_until);
CREATE INDEX IF NOT EXISTS drainage_leads_retention ON drainage_leads(created_at);
CREATE TABLE IF NOT EXISTS drainage_rate_limits (
 key TEXT PRIMARY KEY,
 count INTEGER NOT NULL DEFAULT 0,
 expires_at INTEGER NOT NULL
);
