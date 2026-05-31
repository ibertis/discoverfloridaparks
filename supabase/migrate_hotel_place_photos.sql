-- migrate_hotel_place_photos.sql
-- Adds place_id and photo_reference to park_hotels for Google Places photo/review linking.
-- Safe to re-run (IF NOT EXISTS guards).

ALTER TABLE park_hotels
  ADD COLUMN IF NOT EXISTS place_id       text,
  ADD COLUMN IF NOT EXISTS photo_reference text;

CREATE INDEX IF NOT EXISTS park_hotels_place_id_idx ON park_hotels (place_id)
  WHERE place_id IS NOT NULL;
