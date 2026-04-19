-- Row Level Security policies for Discover Florida Parks
-- Run this in the Supabase SQL Editor. Safe to re-run (uses IF NOT EXISTS / OR REPLACE patterns).

-- ─── parks ────────────────────────────────────────────────────────────────────

ALTER TABLE parks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parks_public_read"    ON parks;
DROP POLICY IF EXISTS "parks_editor_insert"  ON parks;
DROP POLICY IF EXISTS "parks_editor_update"  ON parks;
DROP POLICY IF EXISTS "parks_admin_delete"   ON parks;

CREATE POLICY "parks_public_read" ON parks
  FOR SELECT USING (true);

CREATE POLICY "parks_editor_insert" ON parks
  FOR INSERT WITH CHECK (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "parks_editor_update" ON parks
  FOR UPDATE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "parks_admin_delete" ON parks
  FOR DELETE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
  );

-- ─── park_amenities ───────────────────────────────────────────────────────────

ALTER TABLE park_amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "park_amenities_public_read"   ON park_amenities;
DROP POLICY IF EXISTS "park_amenities_editor_insert" ON park_amenities;
DROP POLICY IF EXISTS "park_amenities_editor_update" ON park_amenities;
DROP POLICY IF EXISTS "park_amenities_admin_delete"  ON park_amenities;

CREATE POLICY "park_amenities_public_read" ON park_amenities
  FOR SELECT USING (true);

CREATE POLICY "park_amenities_editor_insert" ON park_amenities
  FOR INSERT WITH CHECK (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_amenities_editor_update" ON park_amenities
  FOR UPDATE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_amenities_admin_delete" ON park_amenities
  FOR DELETE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
  );

-- ─── park_trails ──────────────────────────────────────────────────────────────

ALTER TABLE park_trails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "park_trails_public_read"   ON park_trails;
DROP POLICY IF EXISTS "park_trails_editor_insert" ON park_trails;
DROP POLICY IF EXISTS "park_trails_editor_update" ON park_trails;
DROP POLICY IF EXISTS "park_trails_admin_delete"  ON park_trails;

CREATE POLICY "park_trails_public_read" ON park_trails
  FOR SELECT USING (true);

CREATE POLICY "park_trails_editor_insert" ON park_trails
  FOR INSERT WITH CHECK (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_trails_editor_update" ON park_trails
  FOR UPDATE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_trails_admin_delete" ON park_trails
  FOR DELETE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
  );

-- ─── park_fun_facts ───────────────────────────────────────────────────────────

ALTER TABLE park_fun_facts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "park_fun_facts_public_read"   ON park_fun_facts;
DROP POLICY IF EXISTS "park_fun_facts_editor_insert" ON park_fun_facts;
DROP POLICY IF EXISTS "park_fun_facts_editor_update" ON park_fun_facts;
DROP POLICY IF EXISTS "park_fun_facts_admin_delete"  ON park_fun_facts;

CREATE POLICY "park_fun_facts_public_read" ON park_fun_facts
  FOR SELECT USING (true);

CREATE POLICY "park_fun_facts_editor_insert" ON park_fun_facts
  FOR INSERT WITH CHECK (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_fun_facts_editor_update" ON park_fun_facts
  FOR UPDATE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_fun_facts_admin_delete" ON park_fun_facts
  FOR DELETE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
  );

-- ─── park_seasonal_events ─────────────────────────────────────────────────────

ALTER TABLE park_seasonal_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "park_seasonal_events_public_read"   ON park_seasonal_events;
DROP POLICY IF EXISTS "park_seasonal_events_editor_insert" ON park_seasonal_events;
DROP POLICY IF EXISTS "park_seasonal_events_editor_update" ON park_seasonal_events;
DROP POLICY IF EXISTS "park_seasonal_events_admin_delete"  ON park_seasonal_events;

CREATE POLICY "park_seasonal_events_public_read" ON park_seasonal_events
  FOR SELECT USING (true);

CREATE POLICY "park_seasonal_events_editor_insert" ON park_seasonal_events
  FOR INSERT WITH CHECK (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_seasonal_events_editor_update" ON park_seasonal_events
  FOR UPDATE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_seasonal_events_admin_delete" ON park_seasonal_events
  FOR DELETE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
  );

-- ─── Storage: park-photos bucket ──────────────────────────────────────────────
-- Run these separately in Storage > Policies if the SQL editor doesn't support storage policies.
-- Restricts uploads to authenticated admin/editor users; public download remains open.

INSERT INTO storage.buckets (id, name, public)
VALUES ('park-photos', 'park-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "park_photos_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "park_photos_editor_upload" ON storage.objects;
DROP POLICY IF EXISTS "park_photos_admin_delete"  ON storage.objects;

CREATE POLICY "park_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'park-photos');

CREATE POLICY "park_photos_editor_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'park-photos'
    AND ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_photos_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'park-photos'
    AND ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
  );
