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
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "parks_editor_update" ON parks
  FOR UPDATE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "parks_admin_delete" ON parks
  FOR DELETE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
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
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_amenities_editor_update" ON park_amenities
  FOR UPDATE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_amenities_admin_delete" ON park_amenities
  FOR DELETE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
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
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_trails_editor_update" ON park_trails
  FOR UPDATE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_trails_admin_delete" ON park_trails
  FOR DELETE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
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
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_fun_facts_editor_update" ON park_fun_facts
  FOR UPDATE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_fun_facts_admin_delete" ON park_fun_facts
  FOR DELETE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
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
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_seasonal_events_editor_update" ON park_seasonal_events
  FOR UPDATE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_seasonal_events_admin_delete" ON park_seasonal_events
  FOR DELETE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
  );

-- ─── park_nearby ─────────────────────────────────────────────────────────────
-- Helper table for nearby park lookups. Public read-only; managed server-side only.

ALTER TABLE park_nearby ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "park_nearby_public_read" ON park_nearby;

CREATE POLICY "park_nearby_public_read" ON park_nearby
  FOR SELECT USING (true);

-- ─── experiences ─────────────────────────────────────────────────────────────

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "experiences_public_read"   ON experiences;
DROP POLICY IF EXISTS "experiences_editor_insert" ON experiences;
DROP POLICY IF EXISTS "experiences_editor_update" ON experiences;
DROP POLICY IF EXISTS "experiences_admin_delete"  ON experiences;

CREATE POLICY "experiences_public_read" ON experiences
  FOR SELECT USING (true);

CREATE POLICY "experiences_editor_insert" ON experiences
  FOR INSERT WITH CHECK (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "experiences_editor_update" ON experiences
  FOR UPDATE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "experiences_admin_delete" ON experiences
  FOR DELETE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
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
    AND ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_photos_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'park-photos'
    AND ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
  );

-- ─── Storage: experience-photos bucket ───────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('experience-photos', 'experience-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "experience_photos_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "experience_photos_editor_upload" ON storage.objects;
DROP POLICY IF EXISTS "experience_photos_admin_delete"  ON storage.objects;

CREATE POLICY "experience_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'experience-photos');

CREATE POLICY "experience_photos_editor_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'experience-photos'
    AND ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "experience_photos_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'experience-photos'
    AND ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
  );

-- ─── Storage: blog-images bucket ─────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "blog_images_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "blog_images_editor_upload" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_delete"  ON storage.objects;

CREATE POLICY "blog_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "blog_images_editor_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images'
    AND ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "blog_images_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images'
    AND ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
  );

-- ─── blog_posts ───────────────────────────────────────────────────────────────

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_public_read"   ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_editor_insert" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_editor_update" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_editor_delete" ON blog_posts;

CREATE POLICY "blog_posts_public_read" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "blog_posts_editor_insert" ON blog_posts
  FOR INSERT WITH CHECK (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "blog_posts_editor_update" ON blog_posts
  FOR UPDATE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "blog_posts_editor_delete" ON blog_posts
  FOR DELETE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

-- ─── park_hotels ──────────────────────────────────────────────────────────────

ALTER TABLE park_hotels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "park_hotels_public_read"   ON park_hotels;
DROP POLICY IF EXISTS "park_hotels_editor_insert" ON park_hotels;
DROP POLICY IF EXISTS "park_hotels_editor_update" ON park_hotels;
DROP POLICY IF EXISTS "park_hotels_admin_delete"  ON park_hotels;

CREATE POLICY "park_hotels_public_read" ON park_hotels
  FOR SELECT USING (true);

CREATE POLICY "park_hotels_editor_insert" ON park_hotels
  FOR INSERT WITH CHECK (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_hotels_editor_update" ON park_hotels
  FOR UPDATE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "park_hotels_admin_delete" ON park_hotels
  FOR DELETE USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
  );
