-- Add price_level column to park_hotels
-- 1 = $ (inexpensive), 2 = $$ (moderate), 3 = $$$ (expensive), 4 = $$$$ (very expensive)
-- Run once in Supabase SQL Editor — safe to re-run

ALTER TABLE park_hotels
  ADD COLUMN IF NOT EXISTS price_level smallint;
