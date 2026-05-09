-- Experiences table schema
-- Run in Supabase SQL Editor. Safe to re-run.
-- RLS policies and storage bucket policies are defined in rls.sql — run that file separately.

-- ─── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS experiences (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  name           text NOT NULL,
  description    text,
  duration       text,
  image_url      text,
  href           text,
  cta_label      text DEFAULT 'Get Details',
  placement_type text DEFAULT 'editorial',
  business_name  text,
  contact_email  text,
  is_active      boolean DEFAULT true,
  is_featured    boolean DEFAULT false,
  sort_order     int DEFAULT 0,
  expires_at     timestamptz
);

-- ─── Migrations ───────────────────────────────────────────────────────────────

ALTER TABLE experiences ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS park_id    uuid REFERENCES parks(id) ON DELETE CASCADE;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS source     text DEFAULT 'viator';
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS price_from text;

CREATE INDEX IF NOT EXISTS experiences_park_id_idx ON experiences(park_id);
