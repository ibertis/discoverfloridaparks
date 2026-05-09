-- Adds activity_types column to parks table
-- Run in Supabase SQL Editor. Safe to re-run.

ALTER TABLE parks ADD COLUMN IF NOT EXISTS activity_types text[] DEFAULT '{}';
