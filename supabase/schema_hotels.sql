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
