-- Experiences table + storage + RLS
-- Run in Supabase SQL Editor. Safe to re-run.

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
  sort_order     int DEFAULT 0,
  expires_at     timestamptz
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "experiences_public_read"    ON experiences;
DROP POLICY IF EXISTS "experiences_editor_insert"  ON experiences;
DROP POLICY IF EXISTS "experiences_editor_update"  ON experiences;
DROP POLICY IF EXISTS "experiences_admin_delete"   ON experiences;

CREATE POLICY "experiences_public_read" ON experiences
  FOR SELECT USING (true);

CREATE POLICY "experiences_editor_insert" ON experiences
  FOR INSERT WITH CHECK (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "experiences_editor_update" ON experiences
  FOR UPDATE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "experiences_admin_delete" ON experiences
  FOR DELETE USING (
    ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
  );

-- ─── Storage ──────────────────────────────────────────────────────────────────

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
    AND ((auth.jwt() -> 'user_metadata') ->> 'role') IN ('admin', 'editor')
  );

CREATE POLICY "experience_photos_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'experience-photos'
    AND ((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin'
  );
