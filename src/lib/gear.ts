// ─────────────────────────────────────────────────────────────────────────────
// gear.ts — DFP Gear & What to Pack Configuration
//
// All REI URLs verified live against rei.com — May 2026
//
// AFFILIATE TRACKING:
// REI links use Impact affiliate network (Publisher: DFP / info@discoverfloridaparks.com)
// Amazon links use Associates tag: discoverflo00-20
//
// REI Impact deep link format (update IMPACT_ID when DFP account is approved):
// https://www.avantlink.com/click.php?tt=cl&merchant_id=REI&website_id=[IMPACT_ID]&url=https://www.rei.com/[path]
//
// IMPACT_ID = 'PENDING' until Impact approves the DFP publisher account.
// Once approved: update IMPACT_ID below and all REI links update automatically.
//
// NETWORK SPLIT:
// REI via Impact — all outdoor gear (tents, paddles, boots, binoculars, etc.)
// Amazon Associates — fishing gear, hunting gear, equestrian gear (REI does not sell these)
// ─────────────────────────────────────────────────────────────────────────────

export interface GearItem {
  name: string;
  description: string;
  url: string;
}

export interface GearCategory {
  label: string;
  amenityKey: string;
  icon?: string;
  items: GearItem[];
}

// ── Affiliate helpers ─────────────────────────────────────────────────────────

const IMPACT_ID: string = 'PENDING'; // ← Update with DFP Impact Publisher ID when approved

function rei(path: string): string {
  if (IMPACT_ID === 'PENDING') {
    return `https://www.rei.com/${path}`;
  }
  return `https://www.avantlink.com/click.php?tt=cl&merchant_id=REI&website_id=${IMPACT_ID}&url=https://www.rei.com/${path}`;
}

const AMAZON_TAG = 'discoverflo00-20';

function amz(searchQuery: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_TAG}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL ITEMS — shown on every park page regardless of amenities
// All URLs verified ✅
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
    url: rei('c/water-bottles'),
  },
  {
    name: 'Lightweight Rain Jacket',
    description: 'Florida afternoon storms arrive without warning',
    url: rei('c/rain-jackets'),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GEAR CATEGORIES — shown based on park amenities
// amenityKey must match boolean column name in park_amenities table
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
        url: rei('c/tents'),
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
        url: rei('c/camp-stoves'),
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
        url: rei('c/hiking-footwear'),
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
        name: 'Trail GPS',
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
        url: rei('c/pfds'),
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

  // ── Swimming & Snorkeling ──────────────────────────────────────────────────
  {
    label: 'Swimming & Snorkeling Gear',
    amenityKey: 'swimming_allowed',
    icon: 'Waves',
    items: [
      {
        name: 'Snorkel Mask Set',
        description: 'Anti-fog wide view — Florida springs are crystal clear',
        url: rei('c/watersports'),
      },
      {
        name: 'Water Shoes',
        description: 'Grip on rocky spring shorelines and riverbeds',
        url: rei('c/water-shoes'),
      },
      {
        name: 'Rash Guard',
        description: 'UPF 50+ sun protection in and out of the water',
        url: rei('c/swim-gear'),
      },
      {
        name: 'Swim Fins',
        description: 'Extend your range in springs and coastal waters',
        url: rei('c/watersports'),
      },
    ],
  },

  // ── Fishing ────────────────────────────────────────────────────────────────
  // Note: REI does not sell fishing or hunting equipment.
  // All fishing gear links use Amazon Associates.
  {
    label: 'Fishing Gear',
    amenityKey: 'fishing_allowed',
    icon: 'Fish',
    items: [
      {
        name: 'Spinning Rod & Reel Combo',
        description: 'Versatile — works for freshwater and saltwater Florida fishing',
        url: amz('spinning rod reel combo freshwater saltwater'),
      },
      {
        name: 'Tackle & Lure Set',
        description: 'Florida-ready lures for bass, snook, and redfish',
        url: amz('fishing tackle lure set bass snook'),
      },
      {
        name: 'Polarized Fishing Sunglasses',
        description: 'Cut glare to spot fish below the surface',
        url: amz('polarized fishing sunglasses'),
      },
      {
        name: 'Cooler / Fish Bag',
        description: 'Keep your catch fresh on Florida\'s warm days',
        url: amz('fishing cooler insulated bag'),
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
        url: rei('c/bike-water-bottles'),
      },
      {
        name: 'Bike Repair Kit',
        description: 'Patch kit, tire levers, and multi-tool — don\'t get stranded',
        url: rei('c/bike-tools'),
      },
    ],
  },

  // ── Wildlife & Birding ─────────────────────────────────────────────────────
  {
    label: 'Wildlife & Birding Gear',
    amenityKey: 'wildlife_viewing',
    icon: 'Binoculars',
    items: [
      {
        name: 'Binoculars',
        description: '8x42 magnification — the standard for Florida birding',
        url: rei('c/binoculars'),
      },
      {
        name: 'Field Guide: Florida Birds',
        description: 'Identify Florida\'s 500+ bird species in the field',
        url: rei('c/camping-and-hiking-guidebooks'),
      },
      {
        name: 'Action Camera',
        description: 'Capture wildlife from a safe, respectful distance',
        url: rei('c/action-cameras'),
      },
      {
        name: 'Quick-Dry Hiking Pants',
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
        name: 'Beach Umbrella & Shelter',
        description: 'UPF 50+ shade — essential for Florida beach days',
        url: rei('c/beach-gear'),
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
        url: rei('c/pfds'),
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
        name: 'Dog Harness',
        description: 'Florida parks require leashes — padded harness for trail comfort',
        url: rei('c/dog-harnesses'),
      },
      {
        name: 'Dog Leash',
        description: '6ft max on Florida trails — durable and tangle-free',
        url: rei('c/dog-leashes'),
      },
      {
        name: 'Dog Life Jacket',
        description: 'Essential for paddle trips and water parks with dogs',
        url: rei('c/dog-pfds'),
      },
      {
        name: 'Dog Gear & Accessories',
        description: 'Collapsible bowls, booties, and more for trail dogs',
        url: rei('c/dog-gear'),
      },
    ],
  },

  // ── Horseback Riding ───────────────────────────────────────────────────────
  // Note: REI does not carry equestrian gear. Amazon Associates used.
  {
    label: 'Equestrian Gear',
    amenityKey: 'horseback_riding',
    icon: 'Horse',
    items: [
      {
        name: 'Riding Helmet',
        description: 'ASTM/SEI certified — required on Florida equestrian trails',
        url: amz('equestrian riding helmet ASTM certified'),
      },
      {
        name: 'Riding Gloves',
        description: 'Grip and rein control on Florida\'s varied terrain',
        url: amz('equestrian riding gloves'),
      },
      {
        name: 'Tall Riding Boots',
        description: 'Ankle protection and stirrup grip for trail riding',
        url: amz('tall equestrian riding boots trail'),
      },
      {
        name: 'Saddle Bag / Cantle Pack',
        description: 'Carry water and supplies on longer Florida rides',
        url: amz('horse saddle cantle bag trail riding'),
      },
    ],
  },

  // ── Hunting ────────────────────────────────────────────────────────────────
  // Note: REI does not sell hunting equipment. Amazon Associates used.
  {
    label: 'Hunting Gear',
    amenityKey: 'hunting_allowed',
    icon: 'Target',
    items: [
      {
        name: 'Blaze Orange Vest',
        description: 'Required safety gear for Florida hunting seasons',
        url: amz('blaze orange hunting vest safety'),
      },
      {
        name: 'Waterproof Hunting Boots',
        description: 'Durable and waterproof for Florida\'s wet terrain',
        url: amz('waterproof hunting boots Florida'),
      },
      {
        name: 'Hunting Binoculars',
        description: '10x42 glass for scouting and spotting game',
        url: amz('hunting binoculars 10x42'),
      },
      {
        name: 'Field Dressing Kit',
        description: 'Lightweight and compact for Florida game processing',
        url: amz('field dressing kit hunting'),
      },
    ],
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// TO ACTIVATE IMPACT TRACKING:
// 1. Log into app.impact.com with info@discoverfloridaparks.com
// 2. Get your DFP Publisher ID from the dashboard
// 3. Apply for REI's program from within that account
// 4. Confirm the exact REI deep link format from Impact dashboard
// 5. Update IMPACT_ID above — all REI links update automatically
// ─────────────────────────────────────────────────────────────────────────────
