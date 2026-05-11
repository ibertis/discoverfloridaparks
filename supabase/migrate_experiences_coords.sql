-- migrate_experiences_coords.sql
-- Adds lat/lng to the experiences catalog table and rewrites get_park_experiences()
-- to filter by haversine distance (≤50 miles) rather than broad region string matching.
-- Run once in Supabase SQL Editor.

-- ─── 1. Add coordinate columns ────────────────────────────────────────────────

ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS latitude  float8,
  ADD COLUMN IF NOT EXISTS longitude float8;

CREATE INDEX IF NOT EXISTS experiences_coords_idx
  ON experiences (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ─── 2. Set focal coordinates for all existing experiences ────────────────────
-- Coordinates represent where the tour departs / operates, not the company HQ.

UPDATE experiences SET latitude = v.lat, longitude = v.lng
FROM (VALUES
  -- Airboat / Everglades
  ('Florida Everglades Airboat Tour & Wild Florida Wildlife Park',              28.1236, -81.2270),
  ('Florida Everglades Airboat Ride & Wildlife Reptile Show',                  25.7617, -80.4359),
  ('Everglades Small-Group Airboat Tour from Miami with Hotel Pickup',         25.7617, -80.4359),
  ('Everglades Biologist-Led Adventure — Airboat, Nature Walk & Cruise from Naples', 26.1420, -81.7948),

  -- Crystal River / West Coast
  ('Crystal River Manatee Swim Tour with In-Water Guide',                      28.8989, -82.5929),
  ('Crystal River Three Sisters Springs & Manatee Clear Kayak Tour',           28.8989, -82.5929),
  ('Clearwater Harbor Sunset Cruise with Champagne Toast',                     27.9659, -82.8001),
  ('Weeki Wachee River Clear Kayak Eco Tour',                                  28.5175, -82.5706),
  ('Tampa Bay Clear Kayak Eco Tour — Shell Key & Mangroves',                   27.6298, -82.7050),

  -- Silver Springs / North FL
  ('Silver Springs Glass Bottom Kayak Tour',                                   29.2176, -82.0554),
  ('Silver Springs Self-Guided Clear Kayak Adventure & Shuttle',               29.2176, -82.0554),

  -- Space Coast / East FL
  ('Indian River Lagoon Guided Boat Tour from Merritt Island',                 28.3511, -80.6670),
  ('Merritt Island Manatee, Sunset & Bioluminescence Kayak Tour',              28.3511, -80.6670),

  -- Central FL / Orlando area
  ('Rock Springs Glass Bottom Guided Kayak Eco Tour',                          28.7396, -81.5069),
  ('Orlando Bass Fishing Charter — Butler Chain of Lakes',                     28.4962, -81.5322),
  ('Lake Tohopekaliga Half-Day Bass Fishing Charter near Kissimmee',           28.2919, -81.4078),
  ('Kissimmee 1-Hour Horseback Trail Ride near Lake Tohopekaliga',             28.2919, -81.4078),
  ('Central Florida Half-Day Private Birding Tour',                            28.5383, -81.3792),
  ('Forever Florida Horseback Adventure in a 4,700-Acre Wildlife Reserve',     28.1236, -81.2270),

  -- Northeast FL
  ('Amelia Island Guided Kayak Eco Tour with Master Naturalist',               30.6018, -81.4628),
  ('St. Augustine Dolphin and Wildlife Adventure Cruise',                      29.8797, -81.3124),

  -- Panhandle / Destin
  ('Destin 6-Hour Deep Sea Fishing Charter',                                   30.3935, -86.4958),
  ('Destin Harbor Sunset Eco-Dolphin Cruise',                                  30.3935, -86.4958),
  ('Destin Spectacular Sunset Cruise with Dolphin Watching',                   30.3935, -86.4958),

  -- Keys / South FL
  ('Key Largo Snorkeling Tour — Two Reef Stops at John Pennekamp',             25.0865, -80.4473),
  ('Key Largo Catamaran Snorkeling Tour — Florida Keys Reef',                  25.0865, -80.4473),
  ('Key Largo Sunset Tour with Dolphin Watching',                              25.0865, -80.4473),
  ('Key West Half-Day Sailing, Kayaking & Snorkeling Adventure',               24.5551, -81.7800),
  ('Key West Sunset Dinner Cruise with Live Music',                            24.5551, -81.7800),
  ('Florida Keys Reef Fishing Experience from Marathon',                       24.7136, -81.0998),
  ('Dry Tortugas National Park Day Trip by Catamaran from Key West',           24.5551, -81.7800),
  ('Rookery Bay Reserve Kayak Eco Tour with Biologist Guide — Naples',         26.0503, -81.7729)
) AS v(name, lat, lng)
WHERE experiences.name = v.name;

-- Verify all rows were updated (should be 0):
-- SELECT name FROM experiences WHERE latitude IS NULL;

-- ─── 3. Add Silver Springs Wildlife & Eco Tours entry ────────────────────────
-- The existing Silver Springs entries use activity_type 'Kayaking & Canoeing'.
-- This entry uses 'Wildlife & Eco Tours' so that inland wildlife parks
-- (e.g. Paynes Prairie, Ocala NF) can match it via activity type.

INSERT INTO experiences (
  name, provider, description, activity_type, regions,
  latitude, longitude,
  affiliate_url, affiliate_source,
  price_from, review_count, rating, duration_hours,
  is_active, is_featured, notes
) VALUES (
  'Florida: Silver Springs Small-Group Clear Kayaking Tour',
  'Discovery Kayak',
  'Glide along the crystal-clear Silver River on a small-group guided tour through Silver Springs State Park. Look through the transparent hull of your clear kayak to spot manatees, river otters, alligators, rhesus monkeys, and hundreds of fish below. A bucket-list Florida wildlife encounter just 26 miles from Gainesville.',
  'Wildlife & Eco Tours',
  ARRAY['North Florida', 'Central Florida'],
  29.2176, -82.0554,
  'https://www.viator.com/tours/Orlando/Silver-Springs-Tour/d663-290298P1?pid=P00300517&mcid=42383&medium=link&campaign=dfp-park-pages',
  'viator',
  45.00, 751, 4.8, 2.0,
  true, false,
  'Same Viator product as Silver Springs Glass Bottom Kayak Tour — different activity_type (Wildlife & Eco Tours) so parks like Paynes Prairie can match it by activity type + distance.'
);

-- ─── 4. Update get_park_experiences() RPC ────────────────────────────────────
-- New parameters: park_lat and park_lng (both DEFAULT NULL for backwards compat).
-- Logic:
--   • If both park AND experience have coordinates → haversine distance ≤ 50 miles
--   • Otherwise → fall back to regions && park_region_list (string array overlap)
-- Results ordered by distance (closest first), then featured/rating/reviews.

CREATE OR REPLACE FUNCTION get_park_experiences(
  park_activity_types text[],
  park_region_list    text[],
  park_lat            float8 DEFAULT NULL,
  park_lng            float8 DEFAULT NULL
)
RETURNS SETOF experiences AS $$
  SELECT * FROM experiences
  WHERE
    activity_type = ANY(park_activity_types)
    AND is_active = true
    AND (
      CASE
        WHEN park_lat  IS NOT NULL
         AND park_lng  IS NOT NULL
         AND latitude  IS NOT NULL
         AND longitude IS NOT NULL
        THEN
          (3959 * acos(
            LEAST(1.0,
              cos(radians(park_lat)) * cos(radians(latitude))
                * cos(radians(longitude) - radians(park_lng))
              + sin(radians(park_lat)) * sin(radians(latitude))
            )
          )) <= 50
        ELSE
          regions && park_region_list
      END
    )
  ORDER BY
    CASE
      WHEN park_lat  IS NOT NULL AND park_lng  IS NOT NULL
       AND latitude  IS NOT NULL AND longitude IS NOT NULL
      THEN
        (3959 * acos(
          LEAST(1.0,
            cos(radians(park_lat)) * cos(radians(latitude))
              * cos(radians(longitude) - radians(park_lng))
            + sin(radians(park_lat)) * sin(radians(latitude))
          )
        ))
    END ASC NULLS LAST,
    is_featured  DESC,
    rating       DESC,
    review_count DESC
  LIMIT 3;
$$ LANGUAGE sql STABLE;
