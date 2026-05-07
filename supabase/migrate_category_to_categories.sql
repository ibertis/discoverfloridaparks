-- Migrate blog_posts.category (text) → categories (text[])
-- Run in Supabase SQL Editor after schema_blog.sql.

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS categories text[];

-- Move existing single-category values into the new array column
UPDATE blog_posts
  SET categories = ARRAY[category]::text[]
  WHERE category IS NOT NULL
    AND (categories IS NULL OR categories = '{}');

ALTER TABLE blog_posts DROP COLUMN IF EXISTS category;

-- GIN index for fast array-contains queries
CREATE INDEX IF NOT EXISTS blog_posts_categories_gin ON blog_posts USING gin(categories);
