// ─────────────────────────────────────────────────────────────────────────────
// gear.ts — DFP Gear & What to Pack Configuration
//
// AFFILIATE TRACKING:
// REI links use Impact affiliate network.
// Once your Impact Publisher ID is confirmed, replace [IMPACT_ID] throughout
// with your actual ID. Current format uses direct REI URLs as placeholders.
//
// REI Impact deep link format:
// https://www.anrdoezrs.net/click-[IMPACT_ID]-10631012?url=https://www.rei.com/[path]
//
// Until Impact ID is confirmed, direct REI URLs are used and will redirect
// correctly — tracking just won't fire. Update once ID is in hand.
// ─────────────────────────────────────────────────────────────────────────────

export interface GearItem {
  name: string;
  description: string;
  url: string;
}

export interface GearCategory {
  label: string;
  amenityKey: string;      // matches boolean column in park_amenities table
  icon?: string;           // optional Lucide icon name for visual treatment
  items: GearItem[];
}

// ── Helper to build REI affiliate URL ────────────────────────────────────────
// Replace [IMPACT_ID] with your Impact Publisher ID when confirmed
// e.g. const IMPACT_ID = '1234567'
const IMPACT_ID: string = 'PENDING'; // ← update this when Impact ID is confirmed

function rei(path: string): string {
  if (IMPACT_ID === 'PENDING') {
    return `https://www.rei.com/${path}`;
  }
  return `https://www.anrdoezrs.net/click-${IMPACT_ID}-10631012?url=https://www.rei.com/${path}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL ITEMS — shown on every park page regardless of amenities
// ─────────────────────────────────────────────────────────────────────────────

export const UNIVERSAL_ITEMS: GearItem[] = [
  {
    name: 'Sunscreen SPF 50+',
    description: 'Reef-safe, broad spectrum — Florida sun is no joke',
    url: rei('c/sunscreen'),
  },
  {
    name: 'Insect Repellent',
    description: 'DEET-free, long-lasting — essential for Florida outdoors',
    url: rei('c/insect-repellent'),
  },
  {
    name: 'Insulated Water Bottle',
    description: 'Stay hydrated in Florida heat — 32oz minimum',
    url: rei('c/water-bottles-and-hydration'),
  },
  {
    name: 'Lightweight Rain Jacket',
    description: 'Florida afternoon storms arrive without warning',
    url: rei('c/rain-jackets'),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GEAR CATEGORIES — shown based on park amenities
// amenityKey must match the boolean column name in park_amenities table
// ─────────────────────────────────────────────────────────────────────────────

export const GEAR_CATEGORIES: GearCategory[] = [

  // ── Camping ────────────────────────────────────────────────────────────────
  {
    label: 'Camping Gear',
    amenityKey: 'camping_available',
    icon: 'Tent',
    items: [
      {
        name: '2-Person Camping Tent',
        description: 'Lightweight & waterproof — Florida-rated',
        url: rei('c/camping-tents'),
      },
      {
        name: 'Sleeping Bag (40°F rated)',
        description: 'Warm Florida nights still get cool in winter',
        url: rei('c/sleeping-bags'),
      },
      {
        name: 'Sleeping Pad',
        description: 'Insulated foam or self-inflating — essential comfort',
        url: rei('c/sleeping-pads'),
      },
      {
        name: 'Camp Stove',
        description: 'Compact backpacking stove for campsite meals',
        url: rei('c/camp-stoves-and-grills'),
      },
      {
        name: 'Headlamp',
        description: 'Hands-free trail lighting — always bring a backup',
        url: rei('c/headlamps'),
      },
    ],
  },

  // ── Hiking ─────────────────────────────────────────────────────────────────
  {
    label: 'Hiking Gear',
    amenityKey: 'hiking_available',
    icon: 'Footprints',
    items: [
      {
        name: 'Trail Shoes or Hiking Boots',
        description: 'Grip & support for Florida\'s sandy and root-covered trails',
        url: rei('c/hiking-boots-and-shoes'),
      },
      {
        name: 'Hydration Pack',
        description: 'Hands-free water carry — 2L minimum for Florida heat',
        url: rei('c/hydration-packs'),
      },
      {
        name: 'Trekking Poles',
        description: 'Reduce knee strain on longer Florida trails',
        url: rei('c/trekking-poles'),
      },
      {
        name: 'Trail Map / GPS',
        description: 'Florida trails can be disorienting — always navigate prepared',
        url: rei('c/gps-devices'),
      },
    ],
  },

  // ── Paddling ───────────────────────────────────────────────────────────────
  {
    label: 'Paddling Gear',
    amenityKey: 'paddling_available',
    icon: 'Waves',
    items: [
      {
        name: 'Kayak Paddle',
        description: 'Lightweight — less fatigue on long Florida water trails',
        url: rei('c/kayak-paddles'),
      },
      {
        name: 'Life Jacket (PFD)',
        description: 'Coast Guard approved — required on Florida waterways',
        url: rei('c/life-jackets-and-pfds'),
      },
      {
        name: 'Dry Bag (20L)',
        description: 'Keep gear waterproof — a necessity on the water',
        url: rei('c/dry-bags'),
      },
      {
        name: 'Waterproof Phone Case',
        description: 'Float-capable pouch for photos and navigation',
        url: rei('c/waterproof-cases'),
      },
    ],
  },

  // ── Swimming ───────────────────────────────────────────────────────────────
  {
    label: 'Swimming & Snorkeling Gear',
    amenityKey: 'swimming_allowed',
    icon: 'Waves',
    items: [
      {
        name: 'Snorkel Mask Set',
        description: 'Anti-fog wide view — Florida springs are crystal clear',
        url: rei('c/snorkeling'),
      },
      {
        name: 'Water Shoes',
        description: 'Grip on rocky spring shorelines and riverbeds',
        url: rei('c/water-shoes'),
      },
      {
        name: 'Rash Guard',
        description: 'UPF 50+ sun protection in and out of the water',
        url: rei('c/rash-guards'),
      },
      {
        name: 'Swim Fins',
        description: 'Extend your range in springs and coastal waters',
        url: rei('c/fins-and-booties'),
      },
    ],
  },

  // ── Fishing ────────────────────────────────────────────────────────────────
  {
    label: 'Fishing Gear',
    amenityKey: 'fishing_allowed',
    icon: 'Fish',
    items: [
      {
        name: 'Spinning Rod & Reel Combo',
        description: 'Versatile — works for freshwater and saltwater Florida fishing',
        url: rei('c/fishing-rods'),
      },
      {
        name: 'Tackle & Lure Set',
        description: 'Florida-ready lures for bass, snook, and redfish',
        url: rei('c/fishing-lures'),
      },
      {
        name: 'Polarized Sunglasses',
        description: 'Cut glare to spot fish below the surface',
        url: rei('c/sunglasses'),
      },
      {
        name: 'Cooler / Fish Bag',
        description: 'Keep your catch fresh on Florida\'s warm days',
        url: rei('c/coolers'),
      },
    ],
  },

  // ── Biking ─────────────────────────────────────────────────────────────────
  {
    label: 'Biking Gear',
    amenityKey: 'biking_available',
    icon: 'Bike',
    items: [
      {
        name: 'Bike Helmet',
        description: 'Non-negotiable — required for trail riding in Florida',
        url: rei('c/bike-helmets'),
      },
      {
        name: 'Cycling Gloves',
        description: 'Grip and comfort on Florida\'s long paved trails',
        url: rei('c/cycling-gloves'),
      },
      {
        name: 'Bike Water Bottle & Cage',
        description: 'Hydration access without stopping on the trail',
        url: rei('c/bike-bottles-and-cages'),
      },
      {
        name: 'Bike Repair Kit',
        description: 'Patch kit, tire levers, and multi-tool — don\'t get stranded',
        url: rei('c/bike-tools-and-repair'),
      },
    ],
  },

  // ── Wildlife Viewing ───────────────────────────────────────────────────────
  {
    label: 'Wildlife & Birding Gear',
    amenityKey: 'wildlife_viewing',
    icon: 'Binoculars',
    items: [
      {
        name: 'Binoculars',
        description: '8x42 magnification — the standard for Florida birding',
        url: rei('c/binoculars-and-scopes'),
      },
      {
        name: 'Field Guide: Florida Birds',
        description: 'Identify Florida\'s 500+ bird species in the field',
        url: rei('c/nature-and-wildlife-books'),
      },
      {
        name: 'Camera with Telephoto Lens',
        description: 'Capture wildlife from a safe, respectful distance',
        url: rei('c/cameras-and-photography'),
      },
      {
        name: 'Quick-Dry Pants',
        description: 'Lightweight, moisture-wicking for Florida\'s humid trails',
        url: rei('c/mens-hiking-pants'),
      },
    ],
  },

  // ── Beach Access ───────────────────────────────────────────────────────────
  {
    label: 'Beach Gear',
    amenityKey: 'beach_access',
    icon: 'Sun',
    items: [
      {
        name: 'Beach Umbrella',
        description: 'UPF 50+ shade — essential for Florida beach days',
        url: rei('c/camp-tarps-and-canopies'),
      },
      {
        name: 'Packable Beach Chair',
        description: 'Lightweight and sand-proof for all-day beach visits',
        url: rei('c/camp-chairs'),
      },
      {
        name: 'Dry Bag / Beach Bag',
        description: 'Keep sand and saltwater away from your gear',
        url: rei('c/dry-bags'),
      },
      {
        name: 'Water Shoes',
        description: 'Protect feet on rocky and shell-covered Florida shorelines',
        url: rei('c/water-shoes'),
      },
    ],
  },

  // ── Boat Launch ────────────────────────────────────────────────────────────
  {
    label: 'Boating Gear',
    amenityKey: 'boat_launch',
    icon: 'Anchor',
    items: [
      {
        name: 'Life Jackets (PFDs)',
        description: 'Florida law requires one per person on board — Coast Guard approved',
        url: rei('c/life-jackets-and-pfds'),
      },
      {
        name: 'Dry Bag (30L+)',
        description: 'Keep gear dry on the water — larger capacity for boat trips',
        url: rei('c/dry-bags'),
      },
      {
        name: 'Waterproof Phone Case',
        description: 'Navigation and photos on the water — float-capable pouch',
        url: rei('c/waterproof-cases'),
      },
      {
        name: 'Marine Cooler',
        description: 'Keep drinks and catch cold on Florida\'s warm water days',
        url: rei('c/coolers'),
      },
    ],
  },

  // ── Dog Friendly ───────────────────────────────────────────────────────────
  {
    label: 'Dog Gear',
    amenityKey: 'dog_friendly',
    icon: 'PawPrint',
    items: [
      {
        name: 'Dog Harness & Leash',
        description: 'Florida parks require leashes — 6ft max on trails',
        url: rei('c/dog-leashes-and-collars'),
      },
      {
        name: 'Collapsible Dog Bowl',
        description: 'Lightweight water and food bowl for trail dogs',
        url: rei('c/dog-bowls-and-feeders'),
      },
      {
        name: 'Dog Life Jacket',
        description: 'Essential for paddle trips and water parks with dogs',
        url: rei('c/dog-life-jackets'),
      },
      {
        name: 'Dog Booties',
        description: 'Protect paws on hot Florida sand and rocky trails',
        url: rei('c/dog-boots'),
      },
    ],
  },

  // ── Horseback Riding ───────────────────────────────────────────────────────
  {
    label: 'Equestrian Gear',
    amenityKey: 'horseback_riding',
    icon: 'Horse',
    items: [
      {
        name: 'Riding Helmet',
        description: 'ASTM/SEI certified — required on Florida equestrian trails',
        url: rei('c/helmets'),
      },
      {
        name: 'Riding Gloves',
        description: 'Grip and rein control on Florida\'s varied terrain',
        url: rei('c/gloves'),
      },
      {
        name: 'Tall Riding Boots',
        description: 'Ankle protection and stirrup grip for trail riding',
        url: rei('c/boots'),
      },
      {
        name: 'Saddle Bag / Cantle Pack',
        description: 'Carry water and supplies on longer Florida rides',
        url: rei('c/bike-bags-and-panniers'),
      },
    ],
  },

  // ── Hunting ────────────────────────────────────────────────────────────────
  {
    label: 'Hunting Gear',
    amenityKey: 'hunting_allowed',
    icon: 'Target',
    items: [
      {
        name: 'Blaze Orange Vest',
        description: 'Required safety gear for Florida hunting seasons',
        url: rei('c/hunting-clothing'),
      },
      {
        name: 'Hunting Boots',
        description: 'Waterproof and durable for Florida\'s wet terrain',
        url: rei('c/hunting-boots'),
      },
      {
        name: 'Binoculars',
        description: '10x42 glass for scouting and spotting game',
        url: rei('c/binoculars-and-scopes'),
      },
      {
        name: 'Field Dressing Kit',
        description: 'Lightweight and compact for Florida game processing',
        url: rei('c/hunting-knives-and-tools'),
      },
    ],
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// IMPACT TRACKING — update when Publisher ID is confirmed
// ─────────────────────────────────────────────────────────────────────────────
// 1. Get your REI Publisher ID from Impact dashboard
// 2. Update IMPACT_ID constant above with your actual ID
// 3. All REI links throughout the site will automatically update
//    (they all go through the rei() helper function)
// ─────────────────────────────────────────────────────────────────────────────
