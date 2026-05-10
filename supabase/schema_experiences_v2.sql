-- Experiences v2 migration — catalog model
-- Run once in Supabase SQL Editor.
--
-- What this does:
--   1. Renames the old park-specific experiences table to park_experiences
--   2. Creates a new catalog-based experiences table (activity_type + regions matching)
--   3. Creates get_park_experiences() RPC for park detail pages
--   4. Seeds Phase 1 Viator affiliate experiences

-- ─── Step 1: Rename old table ─────────────────────────────────────────────────

ALTER TABLE experiences RENAME TO park_experiences;
ALTER INDEX IF EXISTS experiences_park_id_idx RENAME TO park_experiences_park_id_idx;

-- ─── Step 2: Catalog experiences table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS experiences (
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

CREATE INDEX IF NOT EXISTS experiences_activity_type_idx ON experiences(activity_type);
CREATE INDEX IF NOT EXISTS experiences_regions_idx       ON experiences USING GIN(regions);
CREATE INDEX IF NOT EXISTS experiences_active_idx        ON experiences(is_active) WHERE is_active = true;

CREATE OR REPLACE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Step 3: RPC — match experiences to a park ───────────────────────────────
-- park_activity_types: the park's activity_types text[] column
-- park_region_list:    the park's park_regions text[] column (already an array — no splitting needed)

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
  ORDER BY
    is_featured DESC,
    rating       DESC,
    review_count DESC
  LIMIT 3;
$$ LANGUAGE sql STABLE;

-- ─── Step 4: Phase 1 seed — 5 Viator affiliate experiences ───────────────────

INSERT INTO experiences (
  name, provider, description, activity_type, regions,
  affiliate_url, affiliate_source, price_from,
  review_count, rating, duration_hours, is_featured, notes
) VALUES

(
  'Florida Everglades Airboat Tour & Wild Florida Wildlife Park',
  'Wild Florida Airboats',
  'Escape to the wilderness of the Central Florida Everglades on this airboat adventure. Skim through 4,200 acres of protected swamps, marshes, and rivers while spotting alligators, birds, and eagles. Includes admission to the Wild Florida Wildlife Park with over 200 animals. 30-minute or 1-hour airboat ride options.',
  'Airboat Tours',
  ARRAY['Central Florida', 'South Florida'],
  'https://www.viator.com/tours/Orlando/Florida-Everglades-Airboat-Tour-and-Alligator-Encounter-with-Optional-Lunch/d663-5467OHEP?pid=P00300517&mcid=42383&medium=link&campaign=dfp-park-pages',
  'viator', 35.00, 2789, 4.5, 4.0, true,
  'Top-rated Central Florida airboat. Hotel pickup available from Orlando resorts. Optional lunch add-on.'
),

(
  'Crystal River Manatee Swim Tour with In-Water Guide',
  'Fun2Dive',
  'Swim alongside West Indian manatees at Crystal River National Wildlife Refuge — the only place in the world where you can legally interact with these gentle giants in their natural habitat. Small group of 12 max. Wetsuit, mask, and snorkel gear included. Professional underwater photos available.',
  'Manatee Encounters',
  ARRAY['Central Florida', 'North Florida', 'Central Florida, West Coast', 'North Florida, West Coast'],
  'https://www.viator.com/tours/Crystal-River/Manatee-Snorkeling-Tours/d22318-104184P1?pid=P00300517&mcid=42383&medium=link&campaign=dfp-park-pages',
  'viator', 65.00, 3038, 4.7, 3.0, true,
  'Voted TripAdvisor Top 10 Bucket List Experience in the World (2022). Best Nov–Mar for peak manatee season.'
),

(
  'Key Largo Snorkeling Tour — Two Reef Stops at John Pennekamp',
  'Silent World Dive Center',
  'Discover the underwater world of Key Largo on this half-day snorkeling tour visiting two stunning reef sites at John Pennekamp Coral Reef State Park — including Christ of the Deep and Grecian Rocks. Snacks, drinks, snorkeling equipment, and reef-safe sunscreen included. Family friendly.',
  'Snorkeling & Diving',
  ARRAY['South Florida', 'South Florida, The Keys', 'Southeast Florida'],
  'https://www.viator.com/tours/Key-Largo/Two-Tank-Scuba-Dive-OR-Snorkel-Tour-Combo-tour-on-the-same-boat-Shallow-Reefs/d23475-246569P5?pid=P00300517&mcid=42383&medium=link&campaign=dfp-park-pages',
  'viator', 55.00, 414, 4.6, 3.5, true,
  'Visits the only living coral reef in the continental US. All gear and reef-safe sunscreen included.'
),

(
  'Silver Springs Glass Bottom Kayak Tour',
  'Discovery Kayak',
  'Explore one of Florida''s largest freshwater springs on a guided glass-bottom kayak tour. Paddle the crystal-clear Silver River and look through your kayak''s transparent hull to spot manatees, otters, turtles, rhesus monkeys, alligators, and hundreds of fish below.',
  'Kayaking & Canoeing',
  ARRAY['Central Florida', 'North Florida'],
  'https://www.viator.com/tours/Orlando/Silver-Springs-Tour/d663-290298P1?pid=P00300517&mcid=42383&medium=link&campaign=dfp-park-pages',
  'viator', 45.00, 751, 4.8, 2.0, true,
  'Glass-bottom kayaks provide unique underwater viewing. May spot manatees, monkeys, gators, otters. Multiple daily departures.'
),

(
  'Indian River Lagoon Guided Boat Tour from Merritt Island',
  'Captain CJ Tours',
  'Cruise through the biodiverse waters of the Indian River Lagoon and Merritt Island National Wildlife Refuge with a knowledgeable local captain. Spot dolphins, manatees, alligators, bald eagles, and dozens of wading bird species. Morning and afternoon departures.',
  'Wildlife & Eco Tours',
  ARRAY['East Coast', 'Central Florida, East Coast', 'Central Florida', 'North Florida, East Coast'],
  'https://www.viator.com/tours/Cocoa-Beach/Two-hour-boat-tour-of-the-Indian-River-Lagoon/d25319-186244P1?pid=P00300517&mcid=42383&medium=link&campaign=dfp-park-pages',
  'viator', 45.00, 304, 4.7, 2.0, true,
  'Launches from Kelly Park near Merritt Island NWR. Great for Space Coast park visitors. Small intimate boat.'
);
