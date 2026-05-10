# DFP Experiences System — As-Built Reference

This document describes what was actually implemented, including where and why it diverged from the original Claude Chat hand-off document. Use this before making any further changes to the experiences system.

---

## Key Divergences from the Hand-Off Doc

### 1. Hybrid model (not single-table)
The hand-off assumed a fresh `experiences` table. We already had one with a different schema (park-specific, per-park deals). Rather than overwrite it, we implemented a **hybrid**:

| Table | Purpose | How managed |
|---|---|---|
| `park_experiences` | Per-park direct/partner deals (handshake operators) | Via park edit form in admin |
| `experiences` | Catalog of Viator affiliate experiences (auto-matched) | Via `/admin/experiences/` |

### 2. `park_regions` is already `text[]`
The hand-off doc assumed `park_regions` was a comma-separated string and called for `.split(',').map(r => r.trim())`. **It is already a `text[]` array in the DB.** Pass it directly to the RPC — no splitting needed.

### 3. More region values than the hand-off listed
The hand-off provided an incomplete region list. The full set of actual values in the DB:

```
Central Florida
Central Florida, East Coast
Central Florida, West Coast
East Coast
North Florida
North Florida, East Coast
North Florida, West Coast
Northeast Florida
Northwest Florida / Panhandle
South Florida
South Florida, East Coast
South Florida, The Keys
South Florida, West Coast
Southeast Florida
Southwest Florida
West Coast
```

The admin ExperienceEditForm uses this complete list.

### 4. Pipe-separated seed data fixed
The hand-off seed had `'South Florida|Southeast Florida'` as a single array element. This was corrected to two separate values: `'South Florida'` and `'Southeast Florida'`.

### 5. `CREATE OR REPLACE TRIGGER` line caused seed rollback
The `update_updated_at_column()` function didn't exist at the time the migration ran, so the trigger line caused a transaction rollback. The trigger line was removed from `schema_experiences_v2.sql` and a separate `seed_experiences.sql` was used.

### 6. RLS required on the new `experiences` table
The hand-off said "RLS is disabled consistent with all other tables." In practice, Supabase's PostgREST requires either explicit GRANTs or RLS policies for the anon role to read. We enabled RLS with the standard public-read policy (consistent with all other tables in the project).

---

## Actual Database Schema

### `experiences` (catalog — new)
```sql
CREATE TABLE experiences (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name             text NOT NULL,
  provider         text,
  description      text,
  activity_type    text NOT NULL,
  regions          text[] NOT NULL DEFAULT '{}',
  affiliate_url    text NOT NULL,
  affiliate_source text NOT NULL DEFAULT 'viator',
  price_from       numeric(10,2),
  price_currency   text DEFAULT 'USD',
  review_count     integer DEFAULT 0,
  rating           numeric(3,1),
  duration_hours   numeric(4,1),
  is_active        boolean DEFAULT true,
  is_featured      boolean DEFAULT false,
  notes            text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
```

RLS: enabled. Policies: public read, editor insert/update, admin delete.

### `park_experiences` (per-park — renamed from old `experiences`)
```sql
-- Key columns:
park_id       uuid REFERENCES parks(id) ON DELETE CASCADE
name          text
description   text
duration      text
price_from    text
href          text
source        text  -- 'viator' | 'direct' | 'partner'
business_name text
sort_order    int
is_active     boolean
```

RLS: inherited from old `experiences` table (policies renamed with table).

---

## RPC Function

```sql
CREATE OR REPLACE FUNCTION get_park_experiences(
  park_activity_types text[],
  park_region_list    text[]
)
RETURNS SETOF experiences AS $$
  SELECT * FROM experiences
  WHERE
    activity_type = ANY(park_activity_types)
    AND regions && park_region_list
    AND is_active = true
  ORDER BY is_featured DESC, rating DESC, review_count DESC
  LIMIT 3;
$$ LANGUAGE sql STABLE;
```

Called in `src/app/parks/[slug]/page.tsx` as:
```typescript
supabase.rpc('get_park_experiences', {
  park_activity_types: park.activity_types ?? [],
  park_region_list: park.park_regions ?? [],   // already text[] — no splitting
})
```

---

## Files Created / Modified

| File | Change |
|---|---|
| `supabase/schema_experiences_v2.sql` | Rename migration + new catalog table + RPC |
| `supabase/seed_experiences.sql` | Phase 1: 5 Viator experiences (INSERT only) |
| `src/components/ExperienceCard.tsx` | Card component for catalog experiences |
| `src/components/ExperiencesSection.tsx` | Full-bleed section wrapper (off-white bg, shown only when matches exist) |
| `src/app/parks/[slug]/page.tsx` | RPC call added; ExperiencesSection rendered outside max-width container (before Nearby Parks); aliased join `park_experiences:experiences(...)` simplified to `park_experiences(...)` |
| `src/app/admin/experiences/page.tsx` | Rebuilt for catalog schema (activity_type, regions, price, rating, source) |
| `src/app/admin/experiences/[id]/ExperienceEditForm.tsx` | Rebuilt for catalog schema with full region multi-select |
| `src/app/admin/api/save-experience/route.ts` | No change — generic upsert, targets `experiences` table (now catalog) |
| `src/app/admin/api/save-park/route.ts` | `experiences` → `park_experiences` in delete+re-insert logic |
| `src/app/admin/parks/[slug]/ParkEditForm.tsx` | State init: `experiences` → `park_experiences`; ACTIVITY_TYPES updated to match SQL tags |
| `src/app/admin/parks/[slug]/page.tsx` | Added `park_experiences` and `park_hotels` to the park select query |

---

## Component Interfaces

### `CatalogExperience` (exported from `ExperienceCard.tsx`)
```typescript
interface CatalogExperience {
  id: string;
  name: string;
  provider: string | null;
  description: string | null;
  activity_type: string;
  affiliate_url: string;
  affiliate_source: string;
  price_from: number | null;
  price_currency: string;
  review_count: number;
  rating: number | null;
  duration_hours: number | null;
  is_featured: boolean;
}
```

---

## Page Layout — Park Detail

Section order on `/parks/[slug]`:
1. About
2. Photos
3. Amenities & Activities
4. Activities Available (activity_types pills)
5. Guided Tours & Experiences *(per-park `park_experiences`, if any)*
6. What to Pack (gear accordion)
7. Trails
8. Fun Facts
9. Seasonal Events
10. Where to Stay Nearby *(per-park `park_hotels`, if any)*
11. Wildlife
12. Visitor Tips
13. Safety Notes
14. Share Your Visit
15. **"Book an Experience" — `ExperiencesSection`** *(catalog, full-bleed, outside max-width container)*
16. **Nearby Parks** *(also outside max-width container, in its own wrapper)*

---

## Admin URLs

| URL | Purpose |
|---|---|
| `/admin/experiences` | List all catalog experiences |
| `/admin/experiences/new` | Add a new catalog experience |
| `/admin/experiences/[id]` | Edit a catalog experience |
| `/admin/parks/[slug]` | Park edit form — includes "Guided Tours & Experiences" section for per-park direct/partner deals, and "Where to Stay Nearby" for hotel picks |

---

## Phase 1 Seed Experiences

| Name | Activity Type | Regions |
|---|---|---|
| Florida Everglades Airboat Tour & Wild Florida Wildlife Park | Airboat Tours | Central Florida, South Florida |
| Crystal River Manatee Swim Tour with In-Water Guide | Manatee Encounters | Central Florida, North Florida, Central Florida West Coast, North Florida West Coast |
| Key Largo Snorkeling Tour — Two Reef Stops at John Pennekamp | Snorkeling & Diving | South Florida, South Florida The Keys, Southeast Florida |
| Silver Springs Glass Bottom Kayak Tour | Kayaking & Canoeing | Central Florida, North Florida |
| Indian River Lagoon Guided Boat Tour from Merritt Island | Wildlife & Eco Tours | East Coast, Central Florida East Coast, Central Florida, North Florida East Coast |

---

## What's Not Yet Built

- Additional catalog experiences (add via `/admin/experiences/new`)
- Hotel picks per park (add via park edit form → "Where to Stay Nearby")
- "See all experiences" or experiences index page (intentionally deferred — section stays curated)
- GetYourGuide or direct operator experiences (schema supports `affiliate_source` field)
