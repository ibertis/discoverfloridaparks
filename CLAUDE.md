# Discover Florida Parks — Project Reference for AI Assistants

## Project Overview

**Discover Florida Parks** is a Next.js + Supabase park directory covering 49 Florida parks, nature preserves, and outdoor attractions. Migrated from a WordPress + Bricks Builder site (decommissioned). The goal is a fast, SEO-friendly public directory with future monetization (featured placements, affiliate links, user accounts, trip planning).

**User profile:** Non-coder, vibe codes with AI. Big feature ambitions. Same workflow as PremierPersona.

---

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript, Tailwind v4)
- **Database:** Supabase — PostgreSQL, project ID `dteajahghspuqrczutgp`
- **Hosting:** Vercel (planned)
- **Icons:** `@phosphor-icons/react` (decorative fill icons) + `lucide-react` (functional UI icons)
- **Fonts:** Google Fonts — Shrikhand, Glegoo, Archivo

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://dteajahghspuqrczutgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_R1x939gIKnoOXW9EMJDTUQ_YQOmeIRq
```

Supabase client: `src/lib/supabase.ts`

---

## Birdily Design System

The site replicates the Birdily WordPress theme's exact look and feel. **Always match these values exactly.**

### Colors
| Token | Hex | Usage |
|---|---|---|
| accent | `#ff7044` | CTAs, badges, links, icons, active states |
| accent-dark | `#e85a2e` | Hover on orange elements |
| dark | `#413734` | Body text, card text |
| heading-dark | `#362f35` | H1–H4 headings |
| tan | `#a6967c` | Labels, secondary text, muted |
| medium | `#726d6b` | Fine print, footer text |
| border | `#eeeeee` | Dividers, card borders |
| border-dark | `#dfdfdf` | Stronger borders |
| bg | `#ffffff` | Page background (always white) |

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
│   ├── globals.css              # Font imports + CSS variables (Birdily tokens)
│   ├── layout.tsx               # Root layout — clean, no Geist fonts
│   ├── page.tsx                 # Homepage
│   ├── HeroSlider.tsx           # 'use client' — 3-slide hero with arrows + dots
│   ├── ScrollToTop.tsx          # 'use client' — orange scroll-to-top button
│   └── parks/
│       ├── page.tsx             # Park directory — server component, URL-param filtering
│       ├── FilterBar.tsx        # 'use client' — sidebar filters (type, region, amenities, search)
│       └── [slug]/
│           └── page.tsx         # Individual park — SSG via generateStaticParams
├── lib/
│   └── supabase.ts              # Supabase client (anon key, server-safe)
public/
├── dfp-logo.png                 # Orange "Discover" script + "FLORIDA PARKS" all-caps
├── hero-1.jpg                   # Hero slide 1 background
├── hero-2.jpg                   # Hero slide 2 background
└── hero-3.jpg                   # Hero slide 3 background
```

---

## Supabase Schema

**RLS is disabled on all tables** — add policies before production launch.

| Table | Description |
|---|---|
| `parks` | 49 parks — all core fields (slug, name, descriptions, type, region, coords, etc.) |
| `park_amenities` | Boolean flags per park (dog_friendly, camping_available, swimming_allowed, fishing_allowed, boat_launch, picnic_areas, visitor_center, wheelchair_accessible) |
| `park_trails` | Repeater — name, difficulty, length_miles, description, sort_order |
| `park_fun_facts` | Repeater — fact text, sort_order |
| `park_seasonal_events` | Repeater — event_name, month, description, sort_order |
| `park_nearby` | Junction — park_id ↔ nearby_park_id |

Key `parks` fields: `slug` (unique), `name`, `short_description`, `full_description`, `park_type`, `park_region`, `county`, `park_status`, `featured_image_url`, `gallery_urls` (text[]), `address`, `city`, `zip_code`, `latitude`, `longitude`, `park_size_acres`, `year_established`, `managing_agency`, `best_season`, `typical_visit_duration`, `crowd_level`, `google_rating`, `website`, `phone`, `email`, `entrance_fee`, `operating_hours`, `google_maps_link`, `reservation_url`, `camping_url`, `reservation_required`, `visitor_tips`, `instagram_hashtag`, `terrain`, `wildlife_summary`, `safety_notes`, `parking_info`, `nearby_cities`, `distance_from_miami`, `distance_from_orlando`, `distance_from_tampa`, `seo_title`, `seo_description`, `is_featured`

---

## Icon Libraries

### Phosphor Icons (`@phosphor-icons/react` v2.1.x)
Used for decorative/category icons (regions, park types). **All icons were renamed in v2.1 — always use the `Icon` suffix.**

```tsx
// CORRECT (v2.1+)
import { WavesIcon, TreeIcon, MountainsIcon } from '@phosphor-icons/react/dist/ssr';
<WavesIcon weight="fill" size={36} color="#ff7044" />

// WRONG — deprecated, causes TypeScript warnings
import { Waves, Tree } from '@phosphor-icons/react/dist/ssr';
```

Import from `/dist/ssr` for server components, `/dist/csr` for client components.

### Lucide React
Used for all functional UI icons (navigation arrows, map pin, star, search, X, etc.). Lucide does **not** include social brand icons (Facebook, Instagram, YouTube) — use inline SVG for those.

---

## Key Gotchas

1. **Tailwind v4 CSS import order:** `@import url(...)` for Google Fonts **must come before** `@import "tailwindcss"` in `globals.css` — reversed order causes a PostCSS fatal error.

2. **`Map` from lucide-react conflicts** with JavaScript's built-in `Map` constructor. Always alias it: `import { Map as MapIcon } from 'lucide-react'`.

3. **Phosphor `Icon` type import:** `import type { Icon } from '@phosphor-icons/react/dist/lib/types'`

4. **RLS disabled** on all Supabase tables — safe for public read, but add policies before launch.

5. **No `export-parks.php` or migration scripts** — these have been cleaned up. All 49 parks are live in Supabase.

---

## Pages

### `/` — Homepage (`src/app/page.tsx`)
- White nav: logo (240×62) + 5 park type links + orange pill "View Map" CTA
- Header height: 108px
- `HeroSlider` — 3 slides, `88vh` height, left/right arrows, dot indicators
- Featured parks grid (3-col, `is_featured = true`)
- Browse by Region (5 regions, Phosphor fill icons, white cards)
- Browse by Type (6 types, Phosphor fill icons, white cards)
- Map CTA section (dark `#362f35` bg, orange button)
- Footer: logo left + copyright center + social circles + scroll-to-top

### `/parks` — Directory (`src/app/parks/page.tsx`)
- Server component — Supabase query built from URL params (`type`, `region`, `amenities`, `q`)
- Amenity filtering done client-side (join filter in Supabase is verbose)
- `FilterBar` client component — sidebar with type list, region list, amenity checkboxes, search input

### `/parks/[slug]` — Park Detail (`src/app/parks/[slug]/page.tsx`)
- SSG: `generateStaticParams()` → all 49 slugs
- `generateMetadata()` → seo_title / seo_description per park
- Full join: `parks(*, park_amenities(*), park_trails(*), park_fun_facts(*), park_seasonal_events(*))`

---

## Pending / Roadmap

- [ ] Apply Birdily design to `/parks` directory page and `FilterBar`
- [ ] Apply Birdily design to `/parks/[slug]` single park page
- [ ] Build `/map` — react-leaflet, 49 markers, click → popup with link
- [ ] Build `/admin` — park CRUD, protected (Supabase Auth), repeater UIs
- [ ] Add Supabase RLS policies before launch
- [ ] Deploy to Vercel + point `discoverfloridaparks.com`
- [ ] Monetization: featured placements, affiliate links, user accounts, trip planning

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

### Don't
- Don't use a colored or dark background for page sections (exception: hero, map CTA, footer)
- Don't use dynamic Tailwind class construction (`bg-${color}-500`) — use full class names or inline styles
- Don't import `Map` from lucide-react without aliasing as `MapIcon`
- Don't use deprecated Phosphor icon names (without `Icon` suffix)
- Don't add RLS-bypassing anon writes to production without proper policies
