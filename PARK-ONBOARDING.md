# DFP — Park Onboarding Guide

Step-by-step workflow for adding a new park to Discover Florida Parks. Follow this every time a park goes live — in order.

---

## Overview

Adding a new park has two phases:

- **Prep** — manual steps to build the complete park record before publishing
- **Monitoring** — automatic once the park is live (Hermes picks it up the next morning)

---

## Phase 1 — Prep (Manual)

### Step 1 — Create the basic record in Supabase

Add the park to the `parks` table with these required fields populated:

| Field | Notes |
|---|---|
| `name` | Official full name |
| `slug` | Lowercase, hyphens, max 60 characters — see Slug Rules below |
| `website` | HTTPS, official source only, no tracking params |
| `short_description` | 1–2 sentence summary |
| `featured_image_url` | Hosted in Supabase storage |
| `city` | Primary city |
| `county` | County name |
| `latitude` / `longitude` | Must be within Florida bounds |
| `park_types` | Array — see valid values below |
| `park_regions` | Array |
| `managing_agency` | See Managing Agency SQL below |
| `entrance_fee` | Text format e.g. "$6 per vehicle" or "Free" |

---

### Step 2 — Run the enrichment script

```bash
cd /Users/gabrielibertis/Sites/discoverfloridaparks
npx ts-node scripts/enrich-one-park.ts <slug>
```

This populates descriptions, images, categories, and other generated fields.

---

### Step 3 — Add supporting data

These must be researched and entered manually:

**Camping URL** (if the park has camping):
- Must be a park-specific reservation page — not a generic homepage
- Florida State Parks: `https://reserve.floridastateparks.org/Web/#!park/[ID]`
- National parks: `https://www.recreation.gov/camping/gateways/[ID]`
- Other: verify the URL resolves and is specific to this park

**Hotel affiliate links** — `park_hotels` table:
- Use Booking.com affiliate format: `https://www.booking.com/hotel/us/[hotel-id].html?aid=2889331&label=dfp-[park-slug]`
- Every hotel URL must include `aid=2889331` and `label=dfp-[park-slug]`

> Hotels are now sourced using the park's GPS coordinates via Google Places API.
> The script finds the 3 highest-rated hotels within 12km (city parks) or 25km (rural parks).
> Requires `GOOGLE_PLACES_API_KEY` in `.env.local`.

**Experience affiliate links** — `park_experiences` or `experiences` table:
- Use Viator affiliate format: `[viator-url]?pid=P00300517&mcid=42383&medium=link&campaign=dfp-park-pages`
- Every experience URL must include `pid=P00300517` and `mcid=42383`

---

## Affiliate Content Guidelines

**Core principle:** The park always leads. Affiliate content exists to help the visitor have a better visit — not to monetize the visit. DFP should always feel like a trusted local guide, not a product catalog.

### Content hierarchy — always in this order

1. **Park information** (about, amenities, facts, tips, safety) — always dominant
2. **Experiences** (Viator / GetYourGuide) — enhances the visit
3. **Where to stay** (Booking.com / Hotels.com) — practical necessity
4. **Gear** (REI) — supporting context, park-specific only
5. **Everything else** — contextual, not on every page

### Rules

- Maximum 3 hotels per park page — never more
- Maximum 3 experiences per park page — never more
- Gear links must be relevant to that specific park's activities — no generic gear on day-use-only parks
- Never show duplicate booking platforms for the same need — pick the best one per park
- Never add affiliate content before park information content
- Affiliate disclosures must remain clear and present

### Program-specific rules

| Program | Only show when... |
|---|---|
| REI gear links | Park has a relevant activity (hiking, camping, kayaking, fishing, snorkeling) |
| GetYourGuide | Experience not already available on Viator — no duplicates |
| RVshare / Outdoorsy | Park has RV-accessible camping |
| Hipcamp | Park has genuine Hipcamp inventory |
| Second hotel platform | Booking.com has fewer than 2 options for that park |

**What trustworthy looks like:** specific recommendations, genuine descriptions, restrained quantity, park-relevant context, clear disclosure.

**What gimmicky looks like:** generic gear links, multiple competing booking platforms, affiliate sections before park content, forced placement on parks where it doesn't fit.

---

### Step 4 — Set managing_agency

Run this SQL in Supabase to auto-assign based on park_types:

```sql
UPDATE parks
SET managing_agency = CASE
  WHEN park_types @> ARRAY['State Forest']
    THEN 'Florida Forest Service'
  WHEN park_types @> ARRAY['State Parks']
    THEN 'Florida DEP — Division of Recreation and Parks'
  WHEN park_types @> ARRAY['National Parks']
    THEN 'National Park Service'
  WHEN park_types @> ARRAY['National Wildlife Refuge']
    THEN 'U.S. Fish & Wildlife Service'
  WHEN park_types @> ARRAY['County Parks']
    THEN 'County Parks & Recreation'
  WHEN park_types @> ARRAY['Community Parks']
    THEN 'City Parks & Recreation'
  WHEN park_types @> ARRAY['Theme Parks'] OR park_types @> ARRAY['Water Parks']
    THEN 'Private'
  ELSE managing_agency
END
WHERE slug = '<your-slug-here>'
  AND managing_agency IS NULL;
```

---

### Step 5 — Validate

Run the validator from the hermes directory:

```bash
cd /Users/gabrielibertis/Sites/discoverfloridaparks/hermes
node validate-park.js <slug>
```

**Exit codes:**
- `0` — all checks passed, park is ready to go live
- `1` — errors found, must be fixed before publishing
- `2` — warnings only (e.g. optional fields missing), review and decide

**What it checks:**
1. Park record exists in Supabase
2. All required fields are present
3. Slug is 60 characters or fewer
4. Website URL is healthy, HTTPS, no tracking params
5. Camping URL is healthy and park-specific (not a generic homepage)
6. Florida State Parks URL uses the correct `/parks-and-trails/` format
7. Affiliate params present on all hotel and experience links
8. Coordinates are within Florida bounds (lat 24.4–31.0, lon -87.6 to -79.8)

Fix any errors before proceeding.

---

### Step 6 — Add Next.js redirect (if slug was shortened)

If the slug was shortened from a longer official name, add a 301 redirect in `next.config.ts`:

```ts
{
  source: '/parks/the-original-long-slug-here',
  destination: '/parks/new-short-slug',
  permanent: true,
},
```

Deploy before updating the slug in Supabase.

---

### Step 7 — Publish

Deploy the site. The park page is now live.

---

## Phase 2 — Monitoring (Automatic)

Once the park is in Supabase, **Hermes picks it up automatically** in the next daily run at 9:00 AM.

**What Hermes monitors automatically:**
- `website` URL health (HTTP status check)
- `camping_url` health (if present)
- Hotel affiliate links in `park_hotels` — checks `aid=` and `label=` params
- Experience affiliate links in `park_experiences` — checks `pid=` and `mcid=` params
- Entrance fee change detection (for non-bot-protected domains)

**What Hermes does NOT do:**
- Run `enrich-one-park.ts` — this is always manual
- Research or enter camping URLs, hotels, or experiences — always manual
- Set `managing_agency` — run the SQL in Step 4

---

## Slug Rules

- Maximum 60 characters
- Lowercase, hyphens only, no underscores or special characters
- Must be unique across all parks
- Prefer the park's common name over its full official name when the official name is very long
- Run `node validate-park.js <slug>` to confirm length is within limit

**Examples of good slugs:**
- `honeymoon-island-state-park` (28 chars) ✅
- `gtm-nerr` (8 chars, abbreviation for very long name) ✅
- `ocala-national-forest` (21 chars) ✅

**Examples of bad slugs:**
- `guana-tolomato-matanzas-national-estuarine-research-reserve-gtm-nerr` (68 chars) ❌ — too long

---

## Valid park_types Values

```
State Parks
State Forest
National Parks
National Wildlife Refuge
County Parks
Community Parks
Theme Parks
Water Parks
Seasonal Attractions
Sanctuary
National Estuarine Research Reserve
Nature Preserve
```

---

## URL Standards

- Always use HTTPS
- No tracking parameters (`utm_`, `CMP=`, `source=` etc.)
- Florida State Parks format: `https://www.floridastateparks.org/parks-and-trails/[park-name]`
- No old format: `https://www.floridastateparks.org/park/[ParkName]`

**Bot-protected domains** (Hermes skips HTTP check but still validates affiliate params):
- `floridastateparks.org`
- `reserve.floridastateparks.org`
- `seaworld.com`
- `buschgardens.com`
- `aquatica.com`
- `marionfl.org`
- `miamigov.com`
- `miramarparks.com`
- `booking.com`
- `viator.com`

---

## Hermes — Daily Monitoring Agent

**Location:** `/Users/gabrielibertis/Sites/discoverfloridaparks/hermes/`

**Schedule:** Daily at 9:00 AM via macOS launchd

**Manual run:**
```bash
cd /Users/gabrielibertis/Sites/discoverfloridaparks/hermes
node index.js --dry-run   # test run, no email sent
node index.js             # full run, sends email report
```

**Email report sent to:** `gabriel@discoverfloridaparks.com`

**Dependencies:**
- LM Studio must be running with `meta-llama-3.1-8b-instruct` loaded and server started at `http://localhost:1234`
- `.env` file must have valid Supabase and Gmail credentials

---

## LM Studio — Local AI

**Model:** `meta-llama-3.1-8b-instruct` (Q4_K_M, 4.92GB)
**API endpoint:** `http://localhost:1234`
**Purpose:** Powers Hermes alert analysis and fee change detection

Start before running Hermes:
1. Open LM Studio
2. Developer → Start Server
3. Confirm status shows Running at `http://127.0.0.1:1234`
