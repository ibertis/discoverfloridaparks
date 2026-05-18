-- Add pet_friendly column to park_hotels
-- Run once in Supabase SQL Editor
-- Safe to re-run (IF NOT EXISTS guard)

ALTER TABLE park_hotels
  ADD COLUMN IF NOT EXISTS pet_friendly boolean;
