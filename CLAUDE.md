# Discover Florida Parks — Project Reference for AI Assistants

## Project Overview

**Discover Florida Parks** is a Next.js + Supabase park directory covering Florida parks, nature preserves, and outdoor attractions. Migrated from a WordPress + Bricks Builder site (decommissioned). The goal is a fast, SEO-friendly public directory with future monetization (featured placements, affiliate links, user accounts, trip planning).

**User profile:** Non-coder, vibe codes with AI. Big feature ambitions.

---

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript, Tailwind v4)
- **Database:** Supabase — PostgreSQL, project ID `dteajahghspuqrczutgp`
- **CMS:** Sanity (blog posts only) — Studio at `/studio`
- **Hosting:** Vercel — auto-deploys from `main` branch
- **Map:** Mapbox GL JS via `NEXT_PUBLIC_MAPBOX_TOKEN`
- **Email:** Resend — contact form via `/api/contact`, lead magnet via `/api/download-signup`
- **Icons:** `@phosphor-icons/react` (decorative fill icons) + `lucide-react` (functional UI icons)
- **Fonts:** Google Fonts — Shrikhand, Glegoo, Archivo
- **Weather:** Open-Meteo API (no key required) — used on park detail pages

---

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dteajahghspuqrczutgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_R1x939gIKnoOXW9EMJDTUQ_YQOmeIRq

# Mapbox (map page)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token

# Sanity (blog)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-04-21

# Resend (contact form + download signups) — server-side only, NOT NEXT_PUBLIC_
RESEND_API_KEY=re_your_api_key_here
```

- Public Supabase client: `src/lib/supabase.ts`
- Server-only Supabase client: `src/lib/supabase-server.ts` — used in admin routes and middleware
- Admin role stored in `app_metadata.role` (values: `"admin"` or `"editor"`)

---

## Design System

**Reference file:** `dfp-design-system.html` in the project root — open in a browser for a live visual reference of all components, typography, colors, spacing, and button styles. This is the canonical source for the Birdily design system as applied to this project. Consult it when building new UI.

The site replicates the Birdily WordPress theme's exact look and feel. **Always match these values exactly.**

### Colors
| Token | Hex | Usage |
|---|---|---|
| accent | `#ff7044` | CTAs, badges, links, icons, active states |
| accent-dark | `#e85a2e` | Hover on orange elements |
| espresso | `#362f35` | H1–H4 headings, dark surface backgrounds |
| dark | `#413734` | Body text, card text |
| tan | `#a6967c` | Labels, secondary text, muted |
| medium | `#726d6b` | Fine print, footer text |
| border | `#eeeeee` | Dividers, card borders |
| border-dark | `#dfdfdf` | Stronger borders |
| bg | `#ffffff` | Page background (always white) |
| bg-off-white | `#f9f7f5` | Alternating section backgrounds |
| footer-bg | `#edeae5` | Footer background |

### Typography
| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | Shrikhand | 5.35rem | 400 | 1em | -0.04em |
| H2 | Shrikhand | 4.1428rem | 400 | 0.98em | -0.04em |
| H3 | Shrikhand | 3.9285rem | 400 | 0.98em | -0.04em |
| H4 | Shrikhand | 2.1428rem | 400 | 0.98em | -0.04em |
| H5 | Archivo | 2rem | 400 | 1.15em |
| H6 | Archivo | 1.5714rem | 400 | 1.15em |
| Body | Glegoo | 1.1428rem | 700 | 1.55em |

- H1–H4: **Shrikhand** — display font, naturally bold at weight 400
- H5–H6 and all UI text: **Archivo**
- Body text: **Glegoo Bold**

### Layout
- Content max-width: **1278px**
- Pill buttons: `border-radius: 2.3em`
- Background: always white with orange accent pops
- Off-white section bg: `#f9f7f5`
- Footer bg: `#edeae5`

### Key Patterns
```jsx
// Pill CTA button (primary)
style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '14px 36px', fontFamily: 'Archivo, sans-serif', fontWeight: 700 }}

// Pill CTA button (ghost)
style={{ background: 'transparent', color: '#413734', border: '2px solid #413734', borderRadius: '2.3em', padding: '14px 36px', fontFamily: 'Archivo, sans-serif', fontWeight: 700 }}

// Section label (eyebrow)
style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em' }}
```

---

## File Structure

```
src/
├── app/
│   ├── globals.css                        # Font imports + Birdily CSS tokens
│   ├── layout.tsx                         # Root layout
│   ├── page.tsx                           # Homepage
│   ├── not-found.tsx                      # 404 page
│   ├── sitemap.ts                         # Auto-generated sitemap (parks + blog)
│   ├── robots.ts                          # robots.txt
│   ├── SiteHeader.tsx                     # Global nav header
│   ├── SiteFooter.tsx                     # Global footer
│   ├── FooterLinks.tsx                    # 'use client' — contact form + footer columns
│   ├── HeroSlider.tsx                     # 'use client' — 3-slide hero
│   ├── HomeMapSection.tsx                 # Homepage map preview section
│   ├── FeaturedExperiences.tsx            # Homepage experiences module (links to /experiences)
│   ├── NewsletterForm.tsx                 # Newsletter signup form
│   ├── ScrollToTop.tsx                    # 'use client' — scroll-to-top button
│   ├── VideoModal.tsx                     # 'use client' — video lightbox
│   ├── api/
│   │   ├── contact/route.ts               # POST — Resend contact form email
│   │   ├── download-signup/route.ts       # POST — lead magnet signup; emails PDF link via Resend + notifies owner
│   │   └── admin/invite/route.ts          # POST — invite new admin/editor user
│   ├── admin/
│   │   ├── layout.tsx                     # Admin shell layout
│   │   ├── AdminNav.tsx                   # Admin sidebar nav
│   │   ├── page.tsx                       # Dashboard — stats + recently updated
│   │   ├── login/page.tsx                 # Login page (email + password)
│   │   ├── reset-password/page.tsx        # Password reset
│   │   ├── parks/
│   │   │   ├── page.tsx                   # Parks list — search + type filter
│   │   │   ├── new/page.tsx               # New park form
│   │   │   └── [slug]/
│   │   │       ├── page.tsx               # Edit park wrapper
│   │   │       └── ParkEditForm.tsx       # 'use client' — full park edit form
│   │   ├── experiences/
│   │   │   ├── page.tsx                   # Experiences list
│   │   │   ├── new/page.tsx               # New experience form
│   │   │   └── [id]/
│   │   │       ├── page.tsx               # Edit experience wrapper
│   │   │       └── ExperienceEditForm.tsx # 'use client' — experience edit form (is_active + is_featured toggles)
│   │   ├── users/
│   │   │   ├── page.tsx                   # Users list (admin only)
│   │   │   └── UsersClient.tsx            # 'use client' — invite + manage users
│   │   └── api/
│   │       ├── save-park/route.ts         # POST/DELETE — park upsert + delete
│   │       ├── save-experience/route.ts   # POST/DELETE — experience upsert + delete
│   │       ├── upload-park-photo/route.ts # POST — park photo upload to Supabase storage
│   │       └── upload-experience-photo/route.ts
│   ├── parks/
│   │   ├── page.tsx                       # Park directory — server, URL-param filtering
│   │   ├── FilterBar.tsx                  # 'use client' — type, region, amenity, search filters
│   │   └── [slug]/
│   │       ├── page.tsx                   # Park detail — SSG
│   │       ├── ParkMap.tsx                # 'use client' — single park Mapbox map
│   │       ├── PhotoGallery.tsx           # 'use client' — lightbox gallery
│   │       └── WeatherStatCard.tsx        # 'use client' — live weather via Open-Meteo
│   ├── experiences/
│   │   ├── page.tsx                       # All active experiences (Our Deals)
│   │   └── featured/
│   │       └── page.tsx                   # is_featured=true experiences (Upcoming Trips); sorted by expires_at
│   ├── map/
│   │   ├── page.tsx                       # Full map page — all parks
│   │   ├── ParkMap.tsx                    # 'use client' — Mapbox map + type filter chips
│   │   └── MapLoader.tsx                  # Loading skeleton for map
│   ├── blog/
│   │   ├── page.tsx                       # Blog index — fetches from Sanity; category badges are clickable
│   │   ├── [slug]/page.tsx                # Blog post — fetches from Sanity
│   │   └── category/
│   │       └── [slug]/page.tsx            # Blog category page — filters posts by category slug
│   ├── conservation/
│   │   └── page.tsx                       # We Care — Conservation (WeCarePage)
│   ├── preservation/
│   │   └── page.tsx                       # We Care — Preservation (WeCarePage)
│   ├── our-efforts/
│   │   └── page.tsx                       # We Care — Our Efforts (WeCarePage)
│   ├── useful-links/
│   │   └── page.tsx                       # Curated external resource links (4 categories)
│   ├── travel-trends/
│   │   └── page.tsx                       # 'use client' — lead magnet page; name+email form → PDF via Resend
│   └── studio/[[...tool]]/page.tsx        # Sanity Studio embedded at /studio
├── components/
│   ├── ParkCard.tsx                       # Reusable park card (used on homepage + directory)
│   └── WeCarePage.tsx                     # Shared template for conservation/preservation/our-efforts pages
├── lib/
│   ├── supabase.ts                        # Public Supabase client (anon key)
│   └── supabase-server.ts                 # Server-only client + getAdminUser() + getUserRole()
├── middleware.ts                           # Protects /admin routes — checks app_metadata.role
└── sanity/
    ├── env.ts                             # Sanity env var validation
    ├── queries.ts                         # GROQ queries (postsListQuery, postsByCategoryQuery, allCategoriesQuery, etc.)
    ├── structure.ts                       # Sanity Studio structure
    ├── lib/
    │   ├── client.ts                      # Sanity client
    │   ├── image.ts                       # Image URL builder
    │   └── live.ts                        # Live content client
    └── schemaTypes/
        ├── index.ts
        └── post.ts                        # Blog post schema (title, slug, categories[], excerpt, mainImage, body, seoTitle, seoDescription)

supabase/
├── schema_experiences.sql                 # experiences table structure + migrations ONLY — no RLS
├── rls.sql                                # ALL RLS policies + storage bucket policies — single source of truth
scripts/
└── enrich-one-park.ts                     # CLI: enrich a park with Google Places + AI content

public/
├── downloads/                             # Gated PDF assets (e.g. 2026-florida-travel-trends.pdf)
└── logos/
    └── partners/                          # Partner org logos (PNG) — color versions used by default
```

---

## Supabase Schema

**RLS is enabled on all tables.** `rls.sql` is the **single source of truth** for all RLS and storage policies — never define policies in schema files. Re-run `rls.sql` any time you need to audit or reset security.

**Schema files** (`schema_*.sql`) contain table structure only — `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE` migrations. No RLS.

| Table | Description |
|---|---|
| `parks` | Core park records — all fields (slug, name, descriptions, types, regions, coords, etc.) |
| `park_amenities` | Boolean flags per park (dog_friendly, camping_available, swimming_allowed, fishing_allowed, hiking_available, biking_available, horseback_riding, hunting_allowed, paddling_available, wildlife_viewing, boat_launch, picnic_areas, visitor_center, wheelchair_accessible) |
| `park_trails` | Repeater — name, difficulty, length_miles, description, sort_order |
| `park_fun_facts` | Repeater — fact text, sort_order |
| `park_seasonal_events` | Repeater — event_name, month, description, sort_order |
| `park_nearby` | Junction — park_id ↔ nearby_park_id. Public read-only. |
| `experiences` | Featured experiences/attractions — see fields below |

Key `parks` fields: `slug` (unique), `name`, `short_description`, `full_description`, `park_types` (text[]), `park_regions` (text[]), `county`, `park_status`, `featured_image_url`, `gallery_urls` (text[]), `address`, `city`, `zip_code`, `latitude`, `longitude`, `park_size_acres`, `year_established`, `managing_agency`, `best_season`, `typical_visit_duration`, `crowd_level`, `google_rating`, `website`, `phone`, `email`, `entrance_fee`, `operating_hours`, `google_maps_link`, `reservation_url`, `camping_url`, `reservation_required`, `visitor_tips`, `instagram_hashtag`, `terrain`, `wildlife_summary`, `safety_notes`, `parking_info`, `nearby_cities`, `distance_from_miami`, `distance_from_orlando`, `distance_from_tampa`, `seo_title`, `seo_description`, `is_featured`

Key `experiences` fields: `name`, `description`, `duration`, `image_url`, `href`, `cta_label` (default `'Get Details'`), `placement_type` (`editorial` | `sponsored`), `business_name`, `contact_email`, `is_active` (default true), `is_featured` (default false — controls Upcoming Trips page), `sort_order`, `expires_at`

**Important:** `park_types` and `park_regions` are `text[]` arrays. Use `.contains('park_types', [value])` for filtering, not `.eq()`.

**Visitor tips format** — stored as a single `•`-delimited string. Split with `.split('•').map(t => t.trim()).filter(Boolean)` at render time.

---

## Icon Libraries

### Phosphor Icons (`@phosphor-icons/react` v2.1.x)
Used for decorative/category icons (regions, park types). **All icons were renamed in v2.1 — always use the `Icon` suffix.**

```tsx
// CORRECT (v2.1+)
import { WavesIcon, TreeIcon, MountainsIcon } from '@phosphor-icons/react/dist/ssr';
<WavesIcon weight="fill" size={36} color="#ff7044" />
```

Import from `/dist/ssr` for server components, `/dist/csr` for client components.

### Lucide React
Used for all functional UI icons (navigation arrows, map pin, star, search, X, etc.). Does **not** include social brand icons — use inline SVG for those. Always alias: `import { Map as MapIcon } from 'lucide-react'`.

---

## Pages

### `/` — Homepage
- White nav: logo + 5 park type links + orange pill "View Map" CTA
- `HeroSlider` — 3 slides, 88vh
- Featured parks grid (`is_featured = true`)
- Browse by Region + Browse by Type
- `FeaturedExperiences` — homepage experiences module with "All Experiences →" and "Upcoming Trips →" links
- Map CTA section + Footer

### `/parks` — Directory
- Server component — Supabase query from URL params (`type`, `region`, `amenities`, `q`)
- `FilterBar` client component — sidebar filters

### `/parks/[slug]` — Park Detail
- SSG with `generateStaticParams()` + `generateMetadata()`
- Full join with all child tables
- `WeatherStatCard`, `PhotoGallery`, `ParkMap`

### `/experiences` — All Experiences (Our Deals)
- All `is_active = true`, non-expired experiences
- Card grid — shows Featured + Sponsored badges
- Links to `/experiences/featured`

### `/experiences/featured` — Upcoming Trips
- `is_featured = true` experiences only
- Sorted by `expires_at` ascending (soonest first)
- Shows expiry date badge on cards when set
- Dark espresso banner

### `/map` — Interactive Map
- Mapbox GL JS — all parks as markers
- Filter chips by park type

### `/blog` — Blog Index
- Fetches from Sanity CMS
- Category badges are clickable → `/blog/category/[slug]`

### `/blog/[slug]` — Blog Post
- Fetches from Sanity by slug

### `/blog/category/[slug]` — Blog Category
- `generateStaticParams()` from all distinct Sanity categories
- Filters posts by category; empty state with "Browse All Posts" CTA
- Category slug is slugified category name: "Family Trips" → `family-trips`

### `/conservation`, `/preservation`, `/our-efforts` — We Care Pages
- All use `WeCarePage` component
- Each has a `partners[]` array with `name`, `tagline`, `href`, `logo?` fields
- Partner logos: PNG files in `public/logos/partners/` — dark by default via CSS filter, full color on hover
- Logo max-height: 84px (wrap: 96px)

### `/useful-links` — Useful Links
- 4 categories: Plan Your Visit, Maps & Trails, Weather & Safety, Conservation & Learning
- Alternating white / off-white section backgrounds
- Card grid — 4-col desktop → 3-col tablet → 2-col → 1-col

### `/travel-trends` — 2026 Travel Trends (Lead Magnet)
- 'use client' — name + email form
- On submit: POST to `/api/download-signup` → Resend emails PDF link to subscriber + notifies owner
- Immediate download button shown in success state
- PDF file location: `public/downloads/2026-florida-travel-trends.pdf` (must be placed manually)
- "What's Inside" section with 6 chapter previews

### `/admin` — Admin Panel
- Protected by `middleware.ts` — requires `app_metadata.role` of `admin` or `editor`
- Parks + Experiences: full CRUD with photo upload
- Experiences admin: `is_active` (visible on homepage) + `is_featured` (visible on Upcoming Trips page)
- Users: admin-only — invite + manage roles

---

## Blog Category Routing

Category slugs are derived from category names: lowercase, spaces → hyphens, special chars stripped.

```ts
// name → slug
cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

// slug → name (for GROQ query)
slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
```

Footer links use pre-slugified paths: `family-trips`, `travel-tips`, `our-picks`.

---

## Partner Logo Convention (`WeCarePage`)

- Store logos in `public/logos/partners/` as PNG files
- Filename convention: `org-name.png` (color) + `org-name-drk.png` (dark variant, stored for reference)
- CSS handles the dark → color transition on hover via `filter: grayscale(1) brightness(0.24) sepia(0.1)` default, `filter: none` on hover
- Reference the color logo in the `logo` field — the CSS filter handles the dark default state automatically

---

## Lead Magnet Infrastructure

- **Signup route:** `src/app/api/download-signup/route.ts`
- **PDF location:** `public/downloads/` — files served statically
- **PDF URL pattern:** `https://discoverfloridaparks.com/downloads/[filename].pdf`
- Sends branded Resend email to subscriber + owner notification to `hello@discoverfloridaparks.com`
- To add future lead magnets: create a new page + reuse the same API route pattern

---

## Supabase SQL File Convention

| File | Purpose |
|---|---|
| `supabase/rls.sql` | **Single source of truth** — all RLS policies + all storage bucket policies. Re-run to audit or reset. |
| `supabase/schema_experiences.sql` | Table structure + `ALTER TABLE` migrations for experiences. No RLS. |

**Rule:** When adding a new table — define columns in a `schema_*.sql` file, add RLS block to `rls.sql` in the same task. Never split policies across both files.

---

## Key Gotchas

1. **Tailwind v4 CSS import order:** `@import url(...)` for Google Fonts **must come before** `@import "tailwindcss"` in `globals.css`.

2. **`Map` from lucide-react conflicts** with JavaScript's built-in `Map`. Always alias: `import { Map as MapIcon } from 'lucide-react'`.

3. **Phosphor `Icon` suffix:** All Phosphor icon names require the `Icon` suffix in v2.1+.

4. **`park_types` and `park_regions` are arrays** — use `.contains('park_types', [value])` not `.eq()`.

5. **Visitor tips format** — `•`-delimited string. Split at render time, never change storage format.

6. **JSX whitespace around expressions** — `No {category} posts` loses the space. Use template literals: `` {`No ${category} posts`} ``.

7. **RLS role checks** — always use `app_metadata`, never `user_metadata`. `user_metadata` is writable by the client.

---

## Security

### RLS Policy Rules
- **Every new table must have RLS enabled immediately**
- **All policies go in `rls.sql` only** — never in schema files
- **Use `app_metadata` for role checks** — not `user_metadata`
- Standard policy pattern for write-protected tables:
  ```sql
  ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "new_table_public_read"   ON new_table FOR SELECT USING (true);
  CREATE POLICY "new_table_editor_insert" ON new_table FOR INSERT WITH CHECK (((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor'));
  CREATE POLICY "new_table_editor_update" ON new_table FOR UPDATE USING (((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin', 'editor'));
  CREATE POLICY "new_table_admin_delete"  ON new_table FOR DELETE USING (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');
  ```

### Storage Bucket Rules
- Every new bucket needs SELECT, INSERT, and DELETE policies in `rls.sql`
- Restrict INSERT/DELETE to `admin`/`editor` via `app_metadata`

### Admin API Routes
- Every admin API route must call `getAdminUser()` and return 401 before any DB work
- Never expose service-role keys to the browser

### Ongoing Audits
- Check Supabase **Security Advisor** periodically — at minimum when adding new tables
- Run **Rerun linter** after schema changes

---

## Do's and Don'ts

### Do
- Use white background everywhere; orange (`#ff7044`) as the accent pop
- Use Shrikhand for all display headings (H1–H4)
- Use Archivo for all UI text, labels, buttons, nav links
- Use Glegoo Bold for body/description text
- Use pill-shaped buttons (`border-radius: 2.3em`)
- Use 1278px max-width for all page content
- Import Phosphor icons from `/dist/ssr` in server components
- Use the `Icon` suffix for all Phosphor icon names
- Consult `dfp-design-system.html` when building new UI components
- Add new RLS policies to `rls.sql` only — never in schema files

### Don't
- Don't use a colored or dark background for page sections (exception: hero, map CTA, dark banner, footer)
- Don't use dynamic Tailwind class construction (`bg-${color}-500`) — use full class names or inline styles
- Don't import `Map` from lucide-react without aliasing as `MapIcon`
- Don't use deprecated Phosphor icon names (without `Icon` suffix)
- Don't add RLS-bypassing anon writes without proper policies
- Don't create a new table without immediately adding its RLS block to `rls.sql`
- Don't use `user_metadata` for role checks — always use `app_metadata`
- Don't store sensitive credentials or API keys in `user_metadata`
- Don't define RLS policies in schema files — `rls.sql` only
