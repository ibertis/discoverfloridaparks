# Discover Florida Parks — Project Reference for AI Assistants

## Project Overview

**Discover Florida Parks** is a Next.js + Supabase park directory covering Florida parks, nature preserves, and outdoor attractions. Migrated from a WordPress + Bricks Builder site (decommissioned). The goal is a fast, SEO-friendly public directory monetized through affiliate links (hotels, experiences, gear), display ads (AdSense), and future products (app, gear shop).

**User profile:** Non-coder, vibe codes with AI. Big feature ambitions. Cost-sensitive — the project is not yet monetized, so **minimize recurring third-party API spend** (especially Google Places).

---

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript, Tailwind v4)
- **Database + Auth + Storage:** Supabase — PostgreSQL, project ID `dteajahghspuqrczutgp`. Auth via `@supabase/ssr`.
- **Hosting:** Vercel — auto-deploys production from the `main` branch
- **Map:** Mapbox GL JS via `NEXT_PUBLIC_MAPBOX_TOKEN`
- **Email:** Resend — contact form, lead-magnet delivery, admin invites
- **Newsletter:** Kit (formerly ConvertKit) via `KIT_API_KEY` (`/api/subscribe`)
- **Ads:** Google AdSense (`AdUnit` component) + Google Analytics, both via `@next/third-parties`
- **Icons:** `@phosphor-icons/react` (decorative) + `lucide-react` (functional UI)
- **Fonts:** Google Fonts — Shrikhand, Glegoo, Archivo
- **Weather:** Open-Meteo (no key) proxied via `/api/weather`
- **Places data:** Google Places API — hotels, hotel photos, hotel reviews (see **Hotel Photos & Google Places**)

> **No Sanity.** The blog was migrated off Sanity CMS to Supabase (`blog_posts` table + admin CRUD at `/admin/blog`). There is no `/studio` route and no Sanity dependency. Ignore any older reference to Sanity.

---

## Environment Variables

Actual variables referenced by the app (`grep process.env` in `src`):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dteajahghspuqrczutgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...            # publishable key (rotates)
SUPABASE_SERVICE_ROLE_KEY=...                # server-only

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk...

# Google Places (server-only) — hotel photos + reviews
GOOGLE_PLACES_API_KEY=...

# Email / newsletter (server-only)
RESEND_API_KEY=re_...
KIT_API_KEY=...

# Affiliate CJ deeplinks (server-only, optional — fall back to plain URLs)
EXPEDIA_CJ_BASE_URL=...
HOTELS_COM_CJ_BASE_URL=...

# Revalidation (server-only)
REVALIDATE_SECRET=...

# Analytics + Ads (public)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...
NEXT_PUBLIC_ADSENSE_SLOT_BLOG_INCONTENT=...
NEXT_PUBLIC_ADSENSE_SLOT_DIRECTORY_FOOTER=...
NEXT_PUBLIC_ADSENSE_SLOT_PARK_DETAIL_SIDEBAR=...
```

- Public Supabase client: `src/lib/supabase.ts`
- Server-only client + `getAdminUser()` + `getUserRole()`: `src/lib/supabase-server.ts`
- Admin role stored in `app_metadata.role` (values: `"admin"` or `"editor"`)
- **Enrichment scripts + Hermes** use additional secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_PLACES_API_KEY`, `ANTHROPIC_API_KEY`, `LM_STUDIO_URL`/`LM_STUDIO_MODEL`, `RESEND_API_KEY`) via their own `.env.local` / `hermes/.env`.

**Never use the Read tool or `cat` on env files** — this exposes secrets. Inspect key names only: `grep -o '^[^=]*' .env` or `grep '^SPECIFIC_VAR=' .env`.

---

## Design System

**Reference file:** `dfp-design-system.html` in the project root — open in a browser for a live visual reference of all components, typography, colors, spacing, and button styles. Canonical source for the Birdily design system. **Consult it when building new UI.**

The site replicates the Birdily WordPress theme's look and feel. **Match these values exactly.**

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
| H5 | Archivo | 2rem | 400 | 1.15em | |
| H6 | Archivo | 1.5714rem | 400 | 1.15em | |
| Body | Glegoo | 1.1428rem | 700 | 1.55em | |

- H1–H4: **Shrikhand** (display, naturally bold at weight 400)
- H5–H6 and all UI text: **Archivo**
- Body text: **Glegoo Bold**

### Layout
- Content max-width: **1278px**
- Pill buttons: `border-radius: 2.3em`
- Background: always white with orange accent pops; off-white section bg `#f9f7f5`; footer bg `#edeae5`

### Key Patterns
```jsx
// Pill CTA (primary)
style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '14px 36px', fontFamily: 'Archivo, sans-serif', fontWeight: 700 }}
// Pill CTA (ghost)
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
│   ├── layout.tsx                         # Root layout (GA + AdSense via @next/third-parties)
│   ├── page.tsx                           # Homepage
│   ├── not-found.tsx                      # 404 page
│   ├── sitemap.ts                         # Auto-generated sitemap (static pages + parks + blog)
│   ├── robots.ts                          # robots.txt — allows SEO crawlers; blocks AI-training + scraper bots
│   ├── SiteHeader.tsx / SiteFooter.tsx    # Global nav + footer
│   ├── FooterLinks.tsx                    # 'use client' — contact form + footer columns
│   ├── HeroSlider.tsx                     # 'use client' — 3-slide hero
│   ├── HomeMapSection.tsx                 # Homepage map preview
│   ├── FeaturedExperiences.tsx            # Homepage experiences module
│   ├── FeaturedExperiencesList.tsx        # 'use client' — experiences list rendering
│   ├── NewsletterForm.tsx                 # Newsletter signup (→ /api/subscribe → Kit)
│   ├── ScrollToTop.tsx / VideoModal.tsx   # 'use client' utilities
│   ├── api/
│   │   ├── contact/route.ts               # POST — Resend contact email (rate-limited)
│   │   ├── subscribe/route.ts             # POST — Kit newsletter signup (rate-limited)
│   │   ├── download-signup/route.ts       # POST — lead-magnet PDF via Resend (rate-limited)
│   │   ├── weather/route.ts               # GET — Open-Meteo proxy for park weather
│   │   ├── hotel-photo/route.ts           # GET — hotel photo proxy/fallback (see Hotel Photos)
│   │   ├── hotel-reviews/route.ts         # GET — Google Places reviews, on-click (rate-limited, 6h cache)
│   │   ├── revalidate-parks/route.ts      # POST — on-demand ISR revalidation (x-revalidate-secret) — mostly redundant now
│   │   ├── disable-draft/route.ts         # GET — exit blog draft/preview mode
│   │   └── admin/invite/route.ts          # POST — invite admin/editor user
│   ├── admin/
│   │   ├── layout.tsx / AdminNav.tsx      # Admin shell + nav
│   │   ├── page.tsx                       # Dashboard
│   │   ├── login/ · reset-password/       # Auth
│   │   ├── parks/{page, new, [slug]}      # Park CRUD — [slug]/ParkEditForm.tsx ('use client')
│   │   ├── experiences/{page, new, [id]}  # Catalog experiences CRUD (Viator)
│   │   ├── blog/{page, new, [id]}         # Blog post CRUD (Supabase)
│   │   ├── users/                         # User + role management (admin only)
│   │   └── api/
│   │       ├── save-park/route.ts         # POST/DELETE — park upsert/delete + revalidatePath
│   │       ├── save-experience/route.ts   # POST/DELETE — catalog experience upsert/delete
│   │       ├── upload-park-photo/route.ts # POST — park photo → park-photos bucket
│   │       ├── upload-experience-photo/route.ts
│   │       └── upload-blog-image/route.ts # POST — blog image → blog-images bucket
│   ├── parks/
│   │   ├── page.tsx                       # Directory — server, URL-param filtering
│   │   ├── FilterBar.tsx                  # 'use client' — inline dropdown filters
│   │   ├── region/[slug]/page.tsx         # Region hub pages (REGION_MAP = canonical regions)
│   │   └── [slug]/
│   │       ├── page.tsx                   # Park detail — SSG + generateMetadata
│   │       ├── ParkMap.tsx                # 'use client' — single-park Mapbox map
│   │       ├── PhotoGallery.tsx           # 'use client' — lightbox gallery
│   │       ├── WeatherStatCard.tsx        # 'use client' — live weather via /api/weather
│   │       └── HotelReviewsModal.tsx      # 'use client' — reviews modal (fetches on click only)
│   ├── blog/{page, [slug], category/[slug]}   # Blog index, post, category (Supabase)
│   ├── map/{page, ParkMap, MapLoader}     # Full interactive Mapbox map
│   ├── conservation/ · preservation/ · our-efforts/   # "We Care" pages (WeCarePage)
│   ├── useful-links/                      # Curated external resources
│   ├── travel-trends/                     # Lead magnet (name+email → PDF)
│   ├── news/                              # Auto-aggregated RSS news (revalidate 7200)
│   ├── app/                               # "The DFP App — Coming Soon" landing
│   ├── shop/                              # Gear shop — coming soon w/ email capture
│   └── privacy/                           # Privacy policy
├── components/
│   ├── ParkCard.tsx                       # Reusable park card
│   ├── ExperienceCard.tsx                 # Catalog experience card (exports CatalogExperience)
│   ├── ExperiencesSection.tsx             # Full-bleed experiences section on park pages (RPC match)
│   ├── GearRecommendations.tsx            # Affiliate gear (blog + /parks + park detail)
│   ├── AdUnit.tsx                         # AdSense unit
│   ├── NewsletterSignup.tsx               # Reusable newsletter block
│   ├── PreviewBanner.tsx                  # Blog draft-mode banner
│   ├── WeCarePage.tsx                     # Shared conservation/preservation/our-efforts template
│   ├── blog/                              # Blog rendering components
│   └── ui/                                # Primitives
├── lib/
│   ├── supabase.ts / supabase-server.ts   # Clients + getAdminUser/getUserRole
│   ├── blog.ts                            # Supabase blog_posts queries (replaced Sanity)
│   ├── gear.ts                            # Affiliate gear catalog — bc() Backcountry, amz() Amazon
│   ├── news-feeds.ts                      # RSS aggregation for /news
│   ├── slug.ts / utils.ts                 # Helpers
└── middleware.ts                          # Protects /admin — checks app_metadata.role

supabase/                                  # SQL — run in Supabase SQL editor (idempotent)
  rls.sql                                  # SINGLE SOURCE OF TRUTH for all RLS + storage + GRANTs
  schema_blog.sql                          # blog_posts (+ update_updated_at_column trigger fn)
  schema_hotels.sql                        # park_hotels
  schema_experiences.sql / _v2.sql         # per-park + catalog experiences + get_park_experiences RPC
  schema_activity_types.sql
  migrate_hotel_place_photos.sql           # adds park_hotels.place_id + photo_reference (+ index)
  migrate_experiences_coords.sql · migrate_pet_friendly.sql · migrate_price_level.sql
  migrate_category_to_categories.sql · migrate_hotels_to_expedia (see scripts)
  seed_experiences.sql                     # Viator seed data

scripts/                                   # run with `npx tsx scripts/<x>.ts` (loads .env.local)
  lib/{google-places, hotel-photo, nps-api, supabase-admin, fl-state-parks}.ts
  utils/{florida-regions, geo, expedia}.ts
  (see Scripts section for the full list)

hermes/                                    # Standalone monitoring agent — see Hermes section
```

---

## Supabase Schema

**RLS is enabled on all tables.** `rls.sql` is the **single source of truth** for all RLS policies, storage-bucket policies, and GRANTs — never define policies in schema files. `schema_*.sql` files contain table structure only (`CREATE TABLE IF NOT EXISTS` / `ALTER TABLE`).

| Table | Description |
|---|---|
| `parks` | Core park records — all fields (slug, name, descriptions, types, regions, coords, etc.) |
| `park_amenities` | Boolean flags per park (dog_friendly, camping_available, swimming_allowed, fishing_allowed, hiking_available, biking_available, horseback_riding, hunting_allowed, paddling_available, wildlife_viewing, **beach_access**, boat_launch, picnic_areas, visitor_center, wheelchair_accessible) |
| `park_trails` | Repeater — name, difficulty, length_miles, description, sort_order |
| `park_fun_facts` | Repeater — fact, sort_order |
| `park_seasonal_events` | Repeater — event_name, month, description, sort_order |
| `park_nearby` | Junction — park_id ↔ nearby_park_id. Public read-only. |
| `park_hotels` | Per-park hotel picks from Google Places. Key columns: `name, description, url, price_from, sort_order, distance_from_park_km, pet_friendly, price_level, latitude, longitude, place_id, photo_reference`. **`photo_reference` now holds a Supabase Storage https URL** (see Hotel Photos). Managed via park edit form. |
| `park_experiences` | Per-park direct/partner deals (FK `park_id`), hand-curated. Managed via park edit form. |
| `experiences` | **Catalog** of Viator affiliate experiences — auto-matched to park pages by `activity_type` + `regions`/distance. Managed via `/admin/experiences/`. |
| `blog_posts` | Blog content (Supabase-backed; replaced Sanity). Managed via `/admin/blog/`. |

### Storage buckets (all public-read; write restricted to admin/editor)
`park-photos` (also holds migrated hotel photos under `hotels/`), `experience-photos`, `blog-images`.

### Hybrid Experiences Model
Two separate systems — do not confuse:
| System | Table | How matched | Managed |
|---|---|---|---|
| Per-park deals | `park_experiences` | Direct FK (`park_id`) | Park edit form → "Guided Tours & Experiences" |
| Catalog (Viator) | `experiences` | RPC auto-match by `activity_type` + `regions`/coords | `/admin/experiences/` |

RPC `get_park_experiences(park_activity_types text[], park_region_list text[], park_lat float8, park_lng float8)` returns up to 3 matching catalog experiences; when coords are provided it filters by haversine distance (≤50 mi). Called in `src/app/parks/[slug]/page.tsx`; rendered by `ExperiencesSection` (full-bleed).

**Arrays:** `park_types`, `park_regions`, `activity_types` are `text[]` — use `.contains('col', [value])`, never `.eq()` or `.split(',')`.

### Canonical Park Types (exactly these 10 — no others)
```
"National Parks"  "State Parks"  "National Wildlife Refuge"  "Wildlife Management Area"
"County Parks"  "Community Parks"  "Theme Parks"  "Water Parks"  "Preserve"  "State Forest"
```
Retired (do not re-introduce): `"Sanctuary"` and `"National Estuarine Research Reserve"` → consolidated into `"Preserve"` (May 2026). `/parks` H1 uses a `TYPE_HEADING` map for SEO-friendly plural labels without changing stored values — never abbreviate in headings.

### Canonical `park_regions` (must match `REGION_MAP` `dbValue` in `src/app/parks/region/[slug]/page.tsx`)
| Canonical `dbValue` | Hub slug |
|---|---|
| `Florida Panhandle` | `florida-panhandle` |
| `North Florida` | `north-florida` |
| `Northeast Florida` | `northeast-florida` |
| `Central Florida` | `central-florida` |
| `Tampa Bay & West Coast` | `tampa-bay-west-coast` |
| `Southwest Florida` | `southwest-florida` |
| `Southeast Florida` | `southeast-florida` |
| `South Florida` | `south-florida` |
| `Florida Keys` | `florida-keys` |

Hub pages query `.contains('park_regions', [dbValue])` — a wrong label silently returns 0 parks. The `experiences` catalog uses finer-grained region strings in its own `regions` column. Ignore the legacy singular `park_region` column.

**Visitor tips format:** single `•`-delimited string — split with `.split('•').map(t=>t.trim()).filter(Boolean)` at render.

---

## Hotel Photos & Google Places (cost-critical)

Google Places is the only metered ongoing cost. Two surfaces use it: **hotel photos** and **hotel reviews**. The architecture is built to keep steady-state spend at ~$0.

### Photo storage model (the important part)
- **Google Places API (New) photo references EXPIRE.** A stored `places/{placeId}/photos/{photoId}` ref works when fresh, then rots → `HTTP 400 INVALID_ARGUMENT`. Reusing stored refs is the root cause of past `/api/hotel-photo` 502 alerts. **Never rely on a stored raw ref.**
- **Photos are downloaded once and stored in Supabase Storage** (`park-photos/hotels/{placeId}.jpg`). `park_hotels.photo_reference` holds the resulting **https Supabase URL**. Park pages serve `https://`/`/` refs directly with **no Google call at view time** (`src/app/parks/[slug]/page.tsx` ~L728) → $0 ongoing photo cost, and stored images never 502.
- **Helpers** (`scripts/lib/hotel-photo.ts`):
  - `resolveHotelPhoto(freshRef, keyHint)` — download+upload a **fresh** ref. Used by enrichment scripts, which pass a just-fetched ref (valid).
  - `resolveHotelPhotoByPlaceId(placeId)` — fetch a fresh ref via a photos-only Place Details call (cheapest SKU), then store. Used by the backfill of existing/expired refs.
- **Migration/refresh:** `scripts/backfill-hotel-photos-to-storage.ts` — `--dry-run` (free, no Google calls), `--limit N`, `--refresh` (re-fetch https rows too). Run periodically to refresh (Google permits ≤30-day caching of Places content; storing is a mild TOS gray area — refresh occasionally rather than treating storage as a permanent mirror).

### `/api/hotel-photo` (fallback proxy)
Only hit for refs that aren't yet Supabase URLs. Hardened: per-IP rate limit, 6s fetch timeout, `maxDuration=10`, and a 10-min negative cache so stale refs / bots can't re-bill Google or hang the function. Modes: `?ref=https://…` (stream directly) or `?ref=places/…` (billable Place Photo call → stream).

### `/api/hotel-reviews` (on-click only)
`HotelReviewsModal` fetches this **only when a visitor clicks "(N reviews)"** — never on page render. Rate-limited, 6s timeout, and edge-cached **6h** (reviews are Google's most expensive SKU; caching collapses repeat views into one call).

### Google Cloud console caps (owner action — the hard ceiling)
Code keeps spend near zero, but only the console makes it *impossible* to exceed a ceiling: set a **billing budget + alert**, **daily quota caps** on Place Photo + Place Details, and **restrict the API key** to the Places APIs. Not yet configured as of last update.

---

## Icon Libraries

- **Phosphor** (`@phosphor-icons/react` v2.1+) — decorative/category icons. **All names require the `Icon` suffix.** Import from `/dist/ssr` (server) or `/dist/csr` (client): `import { WavesIcon } from '@phosphor-icons/react/dist/ssr'`.
- **Lucide** (`lucide-react`) — functional UI icons. No social brand icons (use inline SVG). **Always alias `Map`:** `import { Map as MapIcon } from 'lucide-react'`.

---

## Pages (public)

- **`/`** — Hero slider, featured parks, browse by region + type, experiences module, map CTA, footer.
- **`/parks`** — Directory. Server component; Supabase query from URL params (`type`, `region`, `amenities`, `q`). Dynamic `generateMetadata` + H1 by selected type. Inline dropdown `FilterBar` (mobile: bottom-sheet). Cards: 4-col desktop → 1-col mobile.
- **`/parks/[slug]`** — Park detail. SSG (`generateStaticParams` + `generateMetadata`); full join with child tables; `WeatherStatCard`, `PhotoGallery`, `ParkMap`, hotels, experiences, gear.
- **`/parks/region/[slug]`** — Region hub pages driven by `REGION_MAP` (canonical regions above).
- **`/map`** — Full Mapbox map; all parks; type filter chips.
- **`/blog`, `/blog/[slug]`, `/blog/category/[slug]`** — Supabase-backed blog. Category slug = slugified category name.
- **`/news`** — Auto-aggregated RSS (`revalidate = 7200`); two columns (Google News queries + partner feeds); `Promise.allSettled` so one bad feed can't break the page.
- **`/conservation`, `/preservation`, `/our-efforts`** — "We Care" pages via `WeCarePage` (partner logos in `public/logos/partners/`, dark→color on hover).
- **`/useful-links`** — 4 categories of curated external links.
- **`/travel-trends`** — Lead magnet; name+email → `/api/download-signup` → Resend PDF link (PDF in `public/downloads/`).
- **`/app`** — "The DFP App — Coming Soon" landing.
- **`/shop`** — Gear shop, coming soon with email capture.
- **`/privacy`** — Privacy policy.

### `/admin` (protected by `middleware.ts` — `app_metadata.role` ∈ {admin, editor})
- **Parks** — full CRUD + photo upload. Edit form writes `park_experiences` ("Guided Tours & Experiences") and `park_hotels` ("Where to Stay Nearby"). Save/delete call `revalidatePath` for the park + collections.
- **Experiences** — catalog `experiences` (Viator) CRUD; auto-match to parks via RPC (no `park_id`).
- **Blog** — `blog_posts` CRUD + image upload; draft/preview mode (`PreviewBanner`, `/api/disable-draft`).
- **Users** — admin-only invite + role management.

---

## Affiliate Content Standards

**Editorial principle:** the park always leads. Affiliate content helps the visitor, it doesn't monetize them. DFP should feel like a trusted local guide, not a product catalog.

Content order (park info dominant): **1** park information → **2** experiences (Viator) → **3** where to stay (Expedia/Hotels.com) → **4** gear (Backcountry/Amazon) → **5** everything else.

Hard limits: **max 3 hotels** and **max 3 experiences** per park; no duplicate booking platforms for the same need; no gear on day-use-only parks; never place affiliate content before park info; disclosures always present.

### Affiliate Programs
| Program | Network | Commission | Notes |
|---|---|---|---|
| Expedia | CJ (CID 7957937) | 4% | Hotel city-search + per-card CTA. `buildExpediaCityUrl()`. Env `EXPEDIA_CJ_BASE_URL`. |
| Hotels.com | CJ (CID 7957937) | 4% / 2% | "Book on Hotels.com" pill per hotel + city fallback. `buildHotelsComUrl()` / `buildHotelsComCityUrl()`. Env `HOTELS_COM_CJ_BASE_URL`. |
| Viator | Direct | ~8% | Experiences. `pid=P00300517&mcid=42383&campaign=dfp-park-pages`. In `experiences.affiliate_url`. |
| Backcountry | Impact (6182914) | ~8% | Primary gear. `bc()` in `src/lib/gear.ts`. |
| Amazon Associates | Direct | ~3% | Fishing/hunting/equestrian/books/consumables. Tag `discoverflo00-20`. Search-query URLs only — never `amzn.to`/ASIN. |
| Booking.com | — | N/A | **Not approved** — old `aid=2889331` is INVALID. Do not use. |
| REI | Impact | — | Not pursued (replaced by Backcountry). |

CJ deeplink format for both hotel programs: `{CJ_BASE_URL}?url={encoded_destination}`. `park_hotels.url` stores the **direct hotel website**; the Hotels.com/Expedia affiliate CTA is built at render time, never stored.

---

## Hotel Enrichment Quality Rules

Enforced in `scripts/fix-hotels-bulk.ts`; preserve in any rewrite.

**Candidate filter (all must pass):** rating ≥ 3.8★; `isLikelyHotel(name)` (rejects airboat rides, outfitters, visitor centres, group camps, scout lodges, primitive campsites, gov facilities); not a `campground` type unless it has a full street address (vicinity contains a digit).

**Radius expansion (stop at first step with ≥1 result):** 12km (25km for `RURAL_CITIES` in `scripts/utils/geo.ts`) → 25km → 50km.

**Display:** heading "Where to Stay Nearby" when closest ≤32km else "Where to Stay"; **bold street address** · distance ("Less than a mile" / "About X miles"). Zero-hotel parks show an Expedia+Hotels.com city-search fallback. Audit with `scripts/audit-hotels.ts` (REMOVE bucket should stay empty).

---

## Hermes — Monitoring Agent

**Location:** `hermes/` · **Schedule:** **weekly, Monday 9 AM** via macOS launchd (`~/Library/LaunchAgents/com.dfp.hermes.plist`; source copy in `hermes/`). Reload after edits: `launchctl unload <plist> && launchctl load <plist>`.

**Modules (`hermes/modules/`):** URL health (`checker`), affiliate links (`affiliateChecker`), gear links (`gearLinks`), fees (`feeChecker` + `feeVerified`), Google Search Console (`gscChecker`), failure analysis (`analyzer`), hotel proximity/coverage/quality, new-park detection (`newParks`), report email (`mailer`).

**AI:** two models — `analyzer.js` uses **Anthropic Claude Haiku** (`ANTHROPIC_API_KEY`) to summarize failures (~1 cheap call/run); `feeChecker.js` uses a **local LM Studio** model (`LM_STUDIO_URL` / `LM_STUDIO_MODEL`, free) with a 90-day TTL. (Ignore any older claim that fee-checking uses Anthropic.)

**Cost posture (kept intentionally low):**
- Hotel `checkHotelProximity` + `checkHotelCoverage` are **report-only by default** — set `HERMES_HOTEL_AUTOFIX=true` to re-enable auto-fix. Their auto-fix path (`hotelHelpers.buildHotelRows`) rebuilds `park_hotels` **without `photo_reference` or `place_id`**, which would wipe migrated photos + reviews and spend Google $. Reports point to the photo-preserving scripts (`fix-hotel-proximity.ts` / `fix-hotels-bulk.ts`) for manual fixes.
- `newParks` still auto-runs `onboard-park.ts` for genuinely new parks (uses `resolveHotelPhoto` with fresh refs — safe).

**Manual run:** `cd hermes && node index.js [--dry-run | --force]`.

---

## Scripts

Run with `npx tsx scripts/<name>.ts` from the project root (loads `.env.local`).

| Script | Purpose |
|---|---|
| `onboard-park.ts` | One-command onboarding: enrich → validate → hotel proximity fix. `--slug <slug>` |
| `enrich-one-park.ts` | Google Places + NPS + Claude enrichment; auto-assigns regions/agency/activities/amenities; stores hotel photos via `resolveHotelPhoto`. Exports `enrichPark()`. |
| `batch-enrich.ts` | Runs `enrichPark()` across recently-added or listed parks |
| `validate-park.ts` / `validate-all-parks.ts` | Correctness checks (GPS, descriptions, image, regions, amenities, hotels, distances). Exports `validatePark()`. |
| `fix-hotel-proximity.ts` | Re-fix hotels with NULL/>30km distance (preserves photos + place_id) |
| `fix-hotels-bulk.ts` | Enrich parks with 0 hotels (quality filter + radius expansion) |
| `backfill-hotel-photos-to-storage.ts` | **Migrate/refresh** hotel photos → Supabase Storage (fresh refs via place_id). `--dry-run` is free. |
| `backfill-hotel-place-ids.ts` | Backfill `place_id` (+ refresh photo via `resolveHotelPhoto`) |
| `backfill-hotel-pet-friendly.ts` / `backfill-hotel-price-level.ts` / `backfill-hotel-websites.ts` | Field backfills |
| `migrate-hotels-to-expedia.ts` | Rebuild `park_hotels.url` to Expedia CJ deeplinks |
| `audit-hotels.ts` / `delete-bad-hotels.ts` | Classify/remove non-lodging rows |
| `generate-park-hero.ts` / `generate-page-heroes.ts` / `generate-region-heroes.ts` | Hero image generation → `park-photos` bucket |
| `populate-parks.ts` / `cleanup-empty-parks.ts` / `migrate-gateway-coords.ts` | Data maintenance |
| `create-admin-user.ts` | Create an admin/editor user |
| `lib/` | `google-places.ts` (findPark/getPlaceDetails/getHotelInfo), `hotel-photo.ts` (resolveHotelPhoto*), `nps-api.ts`, `supabase-admin.ts`, `fl-state-parks.ts`. `utils/`: `florida-regions.ts` (getRegionsForCoords/getManagingAgency), `geo.ts`, `expedia.ts`. |

---

## Monetization

- **Display ads:** Google AdSense via `AdUnit` component; slot IDs in `NEXT_PUBLIC_ADSENSE_SLOT_*`. Placed on blog posts, `/parks` directory footer, park-detail sidebar.
- **Analytics:** Google Analytics (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) + AdSense loaded via `@next/third-parties/google` in `layout.tsx`.
- **Affiliates:** see Affiliate Content Standards.
- **Newsletter:** Kit (`/api/subscribe`, `KIT_API_KEY`) for list building.

---

## Security

### RLS
- Every new table: enable RLS immediately; **all policies + GRANTs live in `rls.sql` only** (never in schema files).
- Use **`app_metadata`** for role checks (client-writable `user_metadata` must never gate access):
  ```sql
  ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "new_table_public_read"   ON new_table FOR SELECT USING (true);
  CREATE POLICY "new_table_editor_insert" ON new_table FOR INSERT WITH CHECK (((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin','editor'));
  CREATE POLICY "new_table_editor_update" ON new_table FOR UPDATE USING (((auth.jwt() -> 'app_metadata') ->> 'role') IN ('admin','editor'));
  CREATE POLICY "new_table_admin_delete"  ON new_table FOR DELETE USING (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');
  ```
- **GRANTs required (enforced Oct 30, 2026):** every new table needs explicit `GRANT`s alongside RLS. Template lives at the bottom of `rls.sql`.
- Storage buckets: SELECT/INSERT/DELETE policies in `rls.sql`; write restricted to admin/editor.

### Admin API routes
Every admin route calls `getAdminUser()` (401 if absent); DELETE handlers also require `getUserRole(user) === 'admin'`. Never expose the service-role key to the browser.

### Public route rate limiting (in-memory, per-IP — maintain on new routes)
- `/api/contact` — 5/hour
- `/api/download-signup` — 3/hour
- `/api/subscribe` — 3/hour
- `/api/hotel-photo` — 60/min (+ 10-min negative cache)
- `/api/hotel-reviews` — 30/min
- `/api/revalidate-parks` — 30/min (also requires `x-revalidate-secret`)

> Rate limiting is per-instance in-memory (resets on cold start, not shared across lambdas) — fine for current scale; use Vercel KV/Upstash if abuse appears.

### Env rules
Never prefix secrets with `NEXT_PUBLIC_`. Public-safe only: Supabase URL/anon key, Mapbox token, GA/AdSense IDs. Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `KIT_API_KEY`, `GOOGLE_PLACES_API_KEY`, `REVALIDATE_SECRET`, CJ base URLs.

---

## Key Gotchas

1. **Tailwind v4 import order:** `@import url(...)` for Google Fonts **must come before** `@import "tailwindcss"` in `globals.css`.
2. **`Map` from lucide-react** shadows JS `Map` — always alias `MapIcon`.
3. **Phosphor `Icon` suffix** required (v2.1+).
4. **`park_types`/`park_regions`/`activity_types` are arrays** — `.contains()`, never `.eq()`/`.split()`.
5. **`park_regions` must use canonical `dbValue` strings** (see table) or hub pages silently return 0 parks.
6. **`beach_access` is a real `park_amenities` column** — gates beach gear in `src/lib/gear.ts`; include it in any amenities type.
7. **Visitor tips** — `•`-delimited string; split at render, never change storage format.
8. **JSX whitespace** around expressions collapses — use template literals: `` {`No ${category} posts`} ``.
9. **RLS role checks use `app_metadata`**, never `user_metadata`.
10. **Google Places (New) photo refs expire** → stored raw refs 400. Always store the **image** (Supabase URL), or fetch a **fresh** ref immediately before use. See Hotel Photos.
11. **`nearby_cities` is `text[]`** — `Array.isArray(v) ? v.join(', ') : v`; guard legacy JSON-string rows with try/catch.
12. **`instagram_hashtag` stored without `#`** — prepend at render.
13. **save-park child records** use delete+re-insert for `park_experiences` + `park_hotels` (keyed on `park_id`); the catalog `experiences` table is untouched by save-park (own route).
14. **Blog is Supabase now** (`blog_posts`, `lib/blog.ts`) — no Sanity, no `/studio`.
15. **`/api/revalidate-parks` is orphaned** — `save-park` revalidates directly via `next/cache`. Keep the route only if you need off-process/bulk revalidation, else it can be deleted.

---

## Do's and Don'ts

### Do
- White background everywhere; orange (`#ff7044`) as the accent
- Shrikhand H1–H4, Archivo UI, Glegoo Bold body; pill buttons (`2.3em`); 1278px max-width
- Import Phosphor from `/dist/ssr`, with the `Icon` suffix; alias lucide `Map` as `MapIcon`
- Consult `dfp-design-system.html` for new UI
- Add RLS **and GRANTs** to `rls.sql` only, in the same task as a new table
- Store hotel photos in Supabase (never rely on a stored Google ref); use `resolveHotelPhoto*`
- Filter array columns with `.contains()`

### Don't
- No colored/dark section backgrounds (except hero, map CTA, dark banner, footer)
- No dynamic Tailwind class construction (`bg-${x}-500`) — full class names or inline styles
- No deprecated Phosphor names (missing `Icon`); no unaliased lucide `Map`
- No RLS policies in schema files (`rls.sql` only); no `user_metadata` role checks
- No new table without its RLS + GRANT block; no service-role key in the browser
- Don't reintroduce Sanity, `/experiences` pages, or auto-fix hotel enrichment in Hermes without weighing the photo-stripping + cost implications
```
