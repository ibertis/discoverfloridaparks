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
│   ├── sitemap.ts                         # Auto-generated sitemap (parks + blog + /news)
│   ├── robots.ts                          # robots.txt — allows all SEO crawlers; blocks AI training bots (GPTBot, ClaudeBot, CCBot, Google-Extended, etc.) and aggressive commercial scrapers (AhrefsBot, SemrushBot, Bytespider, etc.)
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
│   ├── news/
│   │   └── page.tsx                       # Auto-aggregated RSS news — revalidate 7200; two sections (In the News + From Our Partners)
│   └── studio/[[...tool]]/page.tsx        # Sanity Studio embedded at /studio
├── components/
│   ├── ParkCard.tsx                       # Reusable park card (used on homepage + directory)
│   ├── ExperienceCard.tsx                 # Catalog experience card — exports CatalogExperience interface
│   ├── ExperiencesSection.tsx             # Full-bleed "Book an Experience" section — shown on park pages when RPC returns matches
│   └── WeCarePage.tsx                     # Shared template for conservation/preservation/our-efforts pages
├── lib/
│   ├── supabase.ts                        # Public Supabase client (anon key)
│   ├── supabase-server.ts                 # Server-only client + getAdminUser() + getUserRole()
│   └── news-feeds.ts                      # RSS aggregation — fetchAllFeeds(), relativeDate(), dedup(); 5 partner feeds + 4 Google News queries
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
├── schema_experiences_v2.sql              # Rename migration (experiences→park_experiences) + new catalog experiences table + get_park_experiences RPC
├── seed_experiences.sql                   # Phase 1: 5 Viator affiliate experiences (INSERT only — run after schema_experiences_v2.sql)
├── rls.sql                                # ALL RLS policies + storage bucket policies — single source of truth
docs/
└── experiences-system-as-built.md        # Reference doc: divergences from original design, actual schemas, full region list, RPC signature
scripts/
├── enrich-one-park.ts                     # CLI: enrich a park with Google Places + NPS + Claude Sonnet AI
├── batch-enrich.ts                        # Bulk enrichment runner for multiple parks
├── lib/
│   ├── google-places.ts                   # findPark() + getPlaceDetails() — returns PlaceResult incl. reviewCount, types
│   ├── nps-api.ts                         # fetchFloridaNpsParks() — NPS entrance fees + hours
│   └── supabase-admin.ts                  # Service-role Supabase client for scripts
└── utils/
    ├── florida-regions.ts                 # getRegionsForCoords(lat,lng) + getManagingAgency(types,slug)
    └── geo.ts                             # haversineDistance(), getSearchRadius(), MAX_FALLBACK_RADIUS

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
| `park_amenities` | Boolean flags per park (dog_friendly, camping_available, swimming_allowed, fishing_allowed, hiking_available, biking_available, horseback_riding, hunting_allowed, paddling_available, wildlife_viewing, **beach_access**, boat_launch, picnic_areas, visitor_center, wheelchair_accessible) |
| `park_trails` | Repeater — name, difficulty, length_miles, description, sort_order |
| `park_fun_facts` | Repeater — fact text, sort_order |
| `park_seasonal_events` | Repeater — event_name, month, description, sort_order |
| `park_nearby` | Junction — park_id ↔ nearby_park_id. Public read-only. |
| `park_experiences` | Per-park direct/partner deals — managed via park edit form in admin. Renamed from old `experiences` table. |
| `park_hotels` | Per-park Booking.com affiliate hotel picks — managed via park edit form in admin. |
| `experiences` | **Catalog** of Viator affiliate experiences — auto-matched to park pages by `activity_type` + `regions`. Managed via `/admin/experiences/`. |

### Hybrid Experiences Model

There are **two separate experiences systems** — do not confuse them:

| System | Table | How matched | Managed |
|---|---|---|---|
| Per-park deals | `park_experiences` | Direct FK (`park_id`) — hand-curated per park | Park edit form → "Guided Tours & Experiences" |
| Catalog (Viator) | `experiences` | RPC auto-match by `activity_type` + `regions` | `/admin/experiences/` |

The RPC `get_park_experiences(park_activity_types text[], park_region_list text[], park_lat float8, park_lng float8)` returns up to 3 matching catalog experiences for a park detail page. When coordinates are provided, it filters by haversine distance (≤50 miles) rather than region string overlap. Called in `src/app/parks/[slug]/page.tsx`. Results rendered by `ExperiencesSection` (full-bleed, outside max-width container, after main body).

Key `parks` fields: `slug` (unique), `name`, `short_description`, `full_description`, `park_types` (text[]), `park_regions` (text[]), `activity_types` (text[]), `county`, `park_status`, `featured_image_url`, `gallery_urls` (text[]), `address`, `city`, `zip_code`, `latitude`, `longitude`, `park_size_acres`, `year_established`, `managing_agency`, `best_season`, `typical_visit_duration`, `crowd_level`, `google_rating`, `website`, `phone`, `email`, `entrance_fee`, `operating_hours`, `google_maps_link`, `reservation_url`, `camping_url`, `reservation_required`, `visitor_tips`, `instagram_hashtag`, `terrain`, `wildlife_summary`, `safety_notes`, `parking_info`, `nearby_cities`, `distance_from_miami`, `distance_from_orlando`, `distance_from_tampa`, `seo_title`, `seo_description`, `is_featured`

Key `experiences` (catalog) fields: `name`, `provider`, `description`, `activity_type` (text, required), `regions` (text[], required), `affiliate_url` (required), `affiliate_source` (default `'viator'`), `price_from` (numeric), `price_currency` (default `'USD'`), `review_count`, `rating`, `duration_hours`, `is_active` (default true), `is_featured`, `notes`

Key `park_experiences` fields: `park_id` (FK), `name`, `description`, `duration`, `price_from` (text), `href`, `source` (`'viator'` | `'direct'` | `'partner'`), `business_name`, `sort_order`, `is_active`

Key `park_hotels` fields: `park_id` (FK), `name`, `description`, `url`, `price_from` (text), `sort_order`, `latitude`, `longitude`, `distance_from_park_km` (float8)

**Important:** `park_types`, `park_regions`, and `activity_types` are `text[]` arrays. Use `.contains('park_types', [value])` for filtering, not `.eq()`. `park_regions` is already `text[]` — never call `.split(',')` on it.

### Canonical Park Types

The `park_types` column accepts **exactly these 10 values** — no others. Use this exact list in every UI filter, admin form, AI prompt, and enrichment script:

```
"National Parks"
"State Parks"
"National Wildlife Refuge"
"Wildlife Management Area"
"County Parks"
"Community Parks"
"Theme Parks"
"Water Parks"
"Preserve"
"State Forest"
```

**Retired types (do not re-introduce):** `"Sanctuary"` and `"National Estuarine Research Reserve"` were consolidated into `"Preserve"` in May 2026. Any park previously tagged with those types is now tagged `"Preserve"`.

**Display labels:** The `/parks` H1 uses a `TYPE_HEADING` map (`src/app/parks/page.tsx`) to show plural, SEO-friendly labels (e.g. "Explore Our Wildlife Management Areas") without changing stored DB values or filter chip labels. Always use the full phrase — never abbreviate (e.g. "Mgmt") in rendered headings; H1 is a strong SEO signal.

**Managing agency inference:** `getManagingAgency(types, slug)` in `scripts/utils/florida-regions.ts` maps type → agency. `"Preserve"` parks are managed by a mix of agencies, so the function returns `null` for them and falls through to slug-based inference.

---

**`park_regions` canonical naming** — the array must use these exact strings. They are the `dbValue` fields in `REGION_MAP` in `src/app/parks/region/[slug]/page.tsx`, which is the authoritative source of truth.

| Canonical `dbValue` | Hub page slug | Notes |
|---|---|---|
| `Florida Panhandle` | `florida-panhandle` | NOT "Northwest Florida / Panhandle" |
| `North Florida` | `north-florida` | |
| `Northeast Florida` | `northeast-florida` | |
| `Central Florida` | `central-florida` | |
| `Tampa Bay & West Coast` | `tampa-bay-west-coast` | NOT "Central Florida, West Coast" |
| `Southwest Florida` | `southwest-florida` | |
| `Southeast Florida` | `southeast-florida` | |
| `South Florida` | `south-florida` | |
| `Florida Keys` | `florida-keys` | NOT "South Florida, The Keys" |

Hub pages query: `.contains('park_regions', [region.dbValue])`. A wrong label silently returns 0 parks on that hub page. The experiences catalog uses finer-grained region strings (e.g. `"Central Florida, West Coast"`) but those are stored in the `experiences.regions` column, not in `parks.park_regions`.

There is also a legacy `park_region` text column (singular) populated by older import scripts. The app uses `park_regions` (array) everywhere for filtering and matching — ignore `park_region`.

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
- Browse by Region (6 regions: Southeast FL, Southwest FL, Central FL, East Coast, North FL, NW FL/Panhandle) + Browse by Type
- `FeaturedExperiences` — homepage experiences module with "All Experiences →" and "Upcoming Trips →" links
- Map CTA section + Footer

### `/parks` — Directory
- Server component — Supabase query from URL params (`type`, `region`, `amenities`, `q`)
- `generateMetadata` is dynamic — title and description update based on selected `type` param (e.g. "Florida State Parks | Discover Florida Parks")
- H1 updates to "Explore Our [Type]" when a type is selected; falls back to "Explore Our Parks"
- `FilterBar` client component — **horizontal inline dropdown bar** (not a sidebar); 3 dropdown pills (Park Type, Region, Amenities) + search field; mobile uses bottom-sheet drawer unchanged
- Park cards grid: 4 columns desktop, 3 columns tablet, 1 column mobile

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

### `/news` — Florida Parks & Conservation News
- Server component with `revalidate = 7200` (auto-refreshes every 2 hours)
- Two columns: "In the News" (4 Google News RSS queries) + "From Our Partners" (5 partner org feeds)
- Feed sources defined in `src/lib/news-feeds.ts` — `Promise.allSettled` so one failed feed never breaks the page
- Colored initial-letter badge per source (no favicon images)
- Dedup: exact URL match first, then fuzzy title overlap (>70% word overlap = same story)

### `/travel-trends` — 2026 Travel Trends (Lead Magnet)
- 'use client' — name + email form
- On submit: POST to `/api/download-signup` → Resend emails PDF link to subscriber + notifies owner
- Immediate download button shown in success state
- PDF file location: `public/downloads/2026-florida-travel-trends.pdf` (must be placed manually)
- "What's Inside" section with 6 chapter previews

### `/admin` — Admin Panel
- Protected by `middleware.ts` — requires `app_metadata.role` of `admin` or `editor`
- **Parks** (`/admin/parks/`): full CRUD with photo upload. Park edit form includes:
  - "Guided Tours & Experiences" section → writes to `park_experiences` (per-park direct/partner deals)
  - "Where to Stay Nearby" section → writes to `park_hotels`
- **Experiences** (`/admin/experiences/`): manages the **catalog** `experiences` table (Viator affiliate listings). Fields: `activity_type`, `regions` (multi-select), `affiliate_url`, `affiliate_source`, `price_from`, `rating`, `review_count`, `duration_hours`, `is_active`, `is_featured`, `notes`. These auto-match to park pages via RPC — no park_id needed.
- **Users**: admin-only — invite + manage roles

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
| `supabase/schema_experiences_v2.sql` | Rename (`experiences` → `park_experiences`), new catalog `experiences` table, `get_park_experiences` RPC. No seed data. |
| `supabase/migrate_experiences_coords.sql` | Adds `latitude`/`longitude` to `experiences`; populates coordinates for all existing experiences; updates `get_park_experiences` RPC to use haversine distance filtering. |
| `supabase/seed_experiences.sql` | Phase 1 seed: 5 Viator affiliate experiences. Run once after `schema_experiences_v2.sql`. |

**Rule:** When adding a new table — define columns in a `schema_*.sql` file, add both an RLS block **and a GRANT block** to `rls.sql` in the same task. Never split policies across both files.

**GRANT requirement (enforced Oct 30, 2026):** Supabase no longer auto-grants Data API access to public schema tables. Every new table needs explicit GRANTs alongside its RLS policies. Pattern:
```sql
GRANT SELECT                         ON your_table TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON your_table TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON your_table TO service_role;
```
The GRANT section at the bottom of `rls.sql` covers all existing tables and serves as the template.

**Trigger gotcha:** `CREATE OR REPLACE TRIGGER` using `update_updated_at_column()` will fail if that function isn't yet defined (it lives in `schema_blog.sql`). If a migration file includes both schema + seed data and a trigger creation fails, the INSERT statements in the same transaction will roll back. Separate seed data into its own file when in doubt.

---

## Hermes — Monitoring Agent

**Location:** `hermes/`
**Schedule:** Daily at 9:00 AM via macOS launchd (`hermes/com.dfp.hermes.plist`)
**What it monitors:**
- Park URLs — website + camping_url health (~270 parks)
- Affiliate links — Booking.com `aid=`/`label=` + Viator `pid=`/`mcid=` params
- Entrance fees — AI-powered change detection against stored `entrance_fee` values
- Gear links — all REI + Amazon URLs from `src/lib/gear.ts` (404s only — bot-blocks ignored)
- Hotel proximity — detects `park_hotels` rows where `distance_from_park_km` is NULL or >50km, then auto-fixes via Google Places nearbysearch
- Hotel coverage — finds parks with 0 hotel rows and auto-enriches them
- Hotel quality — flags junk entries (airboat tours, visitor centres, gov camps) that slipped through enrichment
- New parks — detects parks added in the last 24 hours with missing enrichment; auto-runs `onboard-park.ts` for each

**AI analysis:** Claude Haiku 4.5 via Anthropic API (`ANTHROPIC_API_KEY` in `hermes/.env`). No local model required — Hermes runs fully unattended.

**Email delivery:** Resend SDK — sends from `hermes@discoverfloridaparks.com` to `gabriel@discoverfloridaparks.com`. Configured via `RESEND_API_KEY` in `hermes/.env`. No Gmail/SMTP credentials needed.

**Manual run:**
```bash
cd /Users/gabrielibertis/Sites/discoverfloridaparks/hermes
node index.js --dry-run   # check only, no email sent
node index.js             # full run, sends email report
node index.js --force     # force re-check all fees (ignores TTL cache)
```

**`hermes/.env` keys** (never use Read tool on this file — grep for key names only):
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `ALERT_EMAIL`

---

## Park Onboarding

See [PARK-ONBOARDING.md](./PARK-ONBOARDING.md) for the complete step-by-step workflow for adding a new park.

---

## Scripts

All scripts run with `npx tsx <script>` from the project root. They load `.env.local` via dotenv.

| Script | Usage | Description |
|---|---|---|
| `scripts/onboard-park.ts` | `npx tsx scripts/onboard-park.ts --slug <slug>` | **One-command onboarding**: chains enrichment → validation → hotel proximity fix. Stops on blocker checks. Prints manual review list for warnings. |
| `scripts/enrich-one-park.ts` | `npx tsx scripts/enrich-one-park.ts "Park Name" [--no-ai] [--no-photo] [--overwrite] [--auto]` | Enriches a park with Google Places + NPS API + Claude Sonnet AI. Auto-assigns `park_regions` from lat/lng, `managing_agency` from park type/slug, `activity_types` and full amenities via AI. Upserts `park_amenities` row. Exports `enrichPark(slug, opts)`. |
| `scripts/batch-enrich.ts` | `npx tsx scripts/batch-enrich.ts [--overwrite] [--slugs=a,b,c]` | Runs `enrichPark()` on all recently added parks with missing data, or on an explicit comma-separated slug list. Reports successes/failures with re-run command. |
| `scripts/validate-park.ts` | `npx tsx scripts/validate-park.ts <slug>` | Runs 9 correctness checks: park exists, has GPS, descriptions, featured image, park_regions, amenities row, hotels, no null distances, no hotels >30km. Exits 1 on blocker failure. Exports `validatePark(slug)`. |
| `scripts/fix-hotel-proximity.ts` | `npx tsx scripts/fix-hotel-proximity.ts [--dry-run] [--slug <slug>]` | Finds parks where hotel `distance_from_park_km` is NULL or >30km, then re-runs Google Places nearbysearch + Booking.com link rebuild. Exports `fixHotelProximityForPark(slug)`. |
| `scripts/fix-hotels-bulk.ts` | `npx tsx scripts/fix-hotels-bulk.ts [--dry-run]` | Finds all parks with 0 `park_hotels` rows and runs the hotel enrichment pipeline for each. Uses multi-step radius expansion (12 → 25 → 50km) and the `isLikelyHotel()` quality filter. |
| `scripts/audit-hotels.ts` | `npx tsx scripts/audit-hotels.ts [--delete-remove] [--delete-all]` | Scans all `park_hotels` rows and categorises them: **REMOVE** (clearly not lodging), **REVIEW** (outdoor accommodation — RV parks, campgrounds), **KEEP** (hotels). Dry-run by default; writes `scripts/data/hotel-audit.json`. |
| `scripts/utils/florida-regions.ts` | (imported by `enrich-one-park.ts`) | `getRegionsForCoords(lat, lng)` — maps coordinates to `park_regions` canonical strings via bounding boxes. `getManagingAgency(parkTypes, slug)` — infers managing agency from park type / slug pattern. |

**Programmatic exports** (used by `onboard-park.ts`):
- `enrichPark(slug, { displayName?, noAi?, noPhoto?, overwrite?, autoApply? })` — `autoApply: true` skips the interactive y/n prompt
- `validatePark(slug)` → `{ passed, checks[], blockers[], warnings[] }`
- `fixHotelProximityForPark(slug)` → `{ fixed, skipped, reason?, error? }`

---

## Hotel Enrichment Quality Rules

These rules are enforced in `scripts/fix-hotels-bulk.ts` and must be preserved in any future rewrite of hotel enrichment logic.

### Candidate filtering (applied before insert)

A Google Places result is accepted as a hotel only if **all** of the following pass:

1. **Rating ≥ 3.8★** — low-rated places excluded
2. **`isLikelyHotel(name)`** — name must not match the `NOT_A_HOTEL` pattern (airboat rides, canoe outfitters, visitor centres, group camps, scout lodges, primitive campsites, cave dive camps, government facilities, etc.)
3. **Not a campground type** — Google Places tags campgrounds with `"campground"` in their `types` array; these are excluded **unless** they have a full street address (vicinity contains a digit — e.g. "1234 Park Rd, Oviedo" passes; "Christmas" or "Mims" alone does not)

### Radius expansion (multi-step)

Search expands in three steps, stopping at the first step that returns ≥1 qualifying result:

| Step | Radius |
|---|---|
| 1 (base) | 12km (25km for cities in `RURAL_CITIES` set in `scripts/utils/geo.ts`) |
| 2 | 25km |
| 3 (cap) | 50km |

This ensures remote parks (WMAs, state forests, wilderness areas) still get hotel coverage from nearby towns, while urban parks stop at the closest results.

### Display rules (park detail page)

- Section heading: **"Where to Stay Nearby"** when closest hotel ≤32km (~20 miles); **"Where to Stay"** when all hotels are >32km
- Description shows: **bold street address** · regular-weight distance (e.g. "4735 Helen Hauser Blvd, Titusville · About 11 miles from [Park Name]")
- Distance text: "Less than a mile" when <1 mile; "About X miles" otherwise (rounded to 1 decimal, drops `.0`)
- If a park has 0 qualifying hotels after all three radius steps, the section is hidden entirely — do not show empty state

### Audit tool

`scripts/audit-hotels.ts` classifies all `park_hotels` rows into REMOVE / REVIEW / KEEP. Run after any bulk enrichment pass. The REMOVE bucket (clearly non-lodging) should always be empty in production.

---

## Affiliate Content Standards

**Editorial principle:** The park always leads. Affiliate content exists to help the visitor have a better visit — not to monetize the visit. DFP should feel like a trusted local guide, not a product catalog.

### Content hierarchy — always in this order

1. **Park information** (about, amenities, facts, tips, safety) — always dominant
2. **Experiences** (Viator / GetYourGuide) — enhances the visit
3. **Where to stay** (Booking.com / Hotels.com) — practical necessity
4. **Gear** (REI via Impact) — supporting context, park-specific only
5. **Everything else** — contextual, not on every page

### Hard limits

- Maximum **3 hotels** per park page — never more
- Maximum **3 experiences** per park page — never more
- No duplicate booking platforms for the same need — pick the best one per park
- No gear links on day-use-only parks (no camping, no water activities)
- Never add affiliate content before park information content
- Affiliate disclosures must remain clear and present

### Affiliate program tracking params

| Program | Required params |
|---|---|
| Booking.com | `aid=2889331&label=dfp-[park-slug]` |
| Viator | `pid=P00300517&mcid=42383&medium=link&campaign=dfp-park-pages` |
| REI (Impact) | TBD — verify in Impact dashboard before adding links |
| GetYourGuide | TBD — only use when experience not already on Viator |

When in doubt, less is more. A page that feels editorial ranks better and converts better than one that feels commercial.

---

## Key Gotchas

1. **Tailwind v4 CSS import order:** `@import url(...)` for Google Fonts **must come before** `@import "tailwindcss"` in `globals.css`.

2. **`Map` from lucide-react conflicts** with JavaScript's built-in `Map`. Always alias: `import { Map as MapIcon } from 'lucide-react'`.

3. **Phosphor `Icon` suffix:** All Phosphor icon names require the `Icon` suffix in v2.1+.

4. **`park_types` and `park_regions` are arrays** — use `.contains('park_types', [value])` not `.eq()`.

5. **`park_regions` canonical values are the hub page `dbValue` strings** — use `"Florida Panhandle"`, `"Tampa Bay & West Coast"`, `"Florida Keys"` (NOT the old admin-form labels `"Northwest Florida / Panhandle"`, `"Central Florida, West Coast"`, `"South Florida, The Keys"`). Wrong labels silently return 0 parks on hub pages. See the canonical table in the Supabase Schema section.

6. **`beach_access` is a real `park_amenities` column** — it gates beach gear recommendations in `src/lib/gear.ts`. It's managed via the "Amenities & Activities" section in the park edit form (admin). Any new amenities interface or type definition for `park_amenities` must include `beach_access: boolean`.

7. **Visitor tips format** — `•`-delimited string. Split at render time, never change storage format.

8. **JSX whitespace around expressions** — `No {category} posts` loses the space. Use template literals: `` {`No ${category} posts`} ``.

9. **RLS role checks** — always use `app_metadata`, never `user_metadata`. `user_metadata` is writable by the client.

10. **`/experiences` and `/experiences/featured` pages are broken** — these public pages still query old `experiences` columns (`duration`, `image_url`, `href`, `cta_label`, `placement_type`, `expires_at`) that no longer exist on the catalog table. They need to be either rebuilt for the new catalog schema or repurposed. Until fixed, they will return Supabase errors and show the empty-state UI.

11. **`nearby_cities` is a `text[]` array** — Supabase returns it as a JS array, not a string. At render time: `Array.isArray(v) ? v.join(', ') : v`. Never call `.split(',')` on it. Some records may still hold a JSON-encoded string from older enrichment runs — guard with a `JSON.parse` try/catch fallback.

12. **`instagram_hashtag` is stored without the `#` prefix** — the enrichment script omits it. Always prepend `#` at render time: `#{park.instagram_hashtag}`.

13. **Two separate save-park child record patterns** — `src/app/admin/api/save-park/route.ts` uses delete+re-insert for both `park_experiences` and `park_hotels`, keyed on `park_id`. The catalog `experiences` table is NOT touched by save-park; it has its own `/admin/api/save-experience/route.ts`.

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
- DELETE handlers must also verify `getUserRole(user) === 'admin'` — editors cannot delete
- Never expose service-role keys to the browser

### Public API Routes — Rate Limiting
All public-facing POST endpoints have in-memory IP-based rate limiting. Maintain this on any new routes:
- `/api/contact` — 5 requests/hour/IP
- `/api/download-signup` — 3 requests/hour/IP
- `/api/subscribe` — 3 requests/hour/IP
- `/api/revalidate-parks` — 30 requests/minute/IP (also requires `x-revalidate-secret` header)

### Environment Variable Rules
- **Never prefix secrets with `NEXT_PUBLIC_`** — anything with that prefix is bundled into client-side JavaScript. Only truly public values (Supabase URL, anon key, Mapbox token, GA ID, AdSense IDs) belong there.
- `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_PLACES_API_KEY`, `REVALIDATE_SECRET`, `SANITY_PREVIEW_SECRET`, `SANITY_API_READ_TOKEN` — server-side only, never `NEXT_PUBLIC_`.
- `.env.local` and `hermes/.env` are both gitignored. **Never use the Read tool or `cat` on env files** — this exposes secrets in conversation context. To inspect: `grep -o '^[^=]*' .env` (key names only) or `grep '^SPECIFIC_VAR_NAME=' .env` for a known non-secret value.

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
