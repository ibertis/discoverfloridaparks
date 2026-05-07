-- Blog posts table for Discover Florida Parks
-- Run in Supabase SQL Editor. Safe to re-run (uses IF NOT EXISTS).

create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  featured_image_url text,
  author text default 'Discover Florida Parks' not null,
  category text,
  tags text[],
  seo_title text,
  seo_description text,
  published boolean default false not null,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists blog_posts_slug_idx on blog_posts(slug);
create index if not exists blog_posts_published_at_idx on blog_posts(published_at desc)
  where published = true;

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_blog_posts_updated_at on blog_posts;
create trigger update_blog_posts_updated_at
  before update on blog_posts
  for each row execute function update_updated_at_column();
