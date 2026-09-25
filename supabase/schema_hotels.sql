-- Park hotels table schema
-- Run in Supabase SQL Editor. Safe to re-run.
-- RLS policies are defined in rls.sql — run that file separately.

CREATE TABLE IF NOT EXISTS park_hotels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  park_id     uuid NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  url         text NOT NULL,
  price_from  text,
  sort_order  int DEFAULT 0
);

CREATE INDEX IF NOT EXISTS park_hotels_park_id_idx ON park_hotels(park_id);

-- Data API grants (required for tables created after 2026-10-30).
-- Read-only for site visitors; all writes go through the admin API routes and
-- scripts using service_role, which bypasses RLS but still needs table grants.
GRANT SELECT ON park_hotels TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON park_hotels TO service_role;
