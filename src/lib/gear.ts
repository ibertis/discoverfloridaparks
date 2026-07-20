// ─────────────────────────────────────────────────────────────────────────────
// gear.ts — DFP Gear & What to Pack Configuration
//
// All "What to Pack" links are Amazon Associates search URLs (tag: discoverflo00-20).
// Consolidated to Amazon-only (2026-07): widest catalog, best conversion for a
// general park-visitor audience, one network to maintain, and search URLs never
// expire.
//
// Rules:
//   Use search query URLs (/s?k=...) only — they never expire.
//   Do NOT use amzn.to short links or ASIN-specific URLs (those can go stale).
//
// Note: the homepage "Backcountry Summer Sale" card (FeaturedExperiences.tsx) is a
// separate, time-boxed paid placement via Impact — not part of this module.
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

const AMAZON_TAG = 'discoverflo00-20';

function amz(searchQuery: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_TAG}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL ITEMS — shown on every park page regardless of amenities
// ─────────────────────────────────────────────────────────────────────────────

export const UNIVERSAL_ITEMS: GearItem[] = [
  {
    name: 'Sunscreen SPF 50+',
    description: 'Reef-safe, broad spectrum — Florida sun is no joke',
    url: amz('reef safe sunscreen SPF 50 outdoor'),
  },
  {
    name: 'Insect Repellent',
    description: 'DEET-free, long-lasting — essential for Florida outdoors',
    url: amz('DEET free insect repellent outdoor long lasting'),
  },
  {
    name: 'Insulated Water Bottle',
    description: 'Stay hydrated in Florida heat — 32oz minimum',
    url: amz('insulated water bottle 32oz hiking'),
  },
  {
    name: 'Lightweight Rain Jacket',
    description: 'Florida afternoon storms arrive without warning',
    url: amz('lightweight packable rain jacket hiking'),
  },
  {
    name: 'Polarized Sunglasses',
    description: 'Cut glare on water and trails — a Florida must-have',
    url: amz('polarized sunglasses UV400 outdoor'),
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
        url: amz('2 person camping tent lightweight waterproof'),
      },
      {
        name: 'Sleeping Bag (40°F rated)',
        description: 'Warm Florida nights still get cool in winter',
        url: amz('sleeping bag 40 degree camping'),
      },
      {
        name: 'Sleeping Pad',
        description: 'Insulated foam or self-inflating — essential comfort',
        url: amz('sleeping pad camping self inflating'),
      },
      {
        name: 'Camp Stove',
        description: 'Compact backpacking stove for campsite meals',
        url: amz('backpacking camp stove compact'),
      },
      {
        name: 'Headlamp',
        description: 'Hands-free trail lighting — always bring a backup',
        url: amz('headlamp camping rechargeable bright'),
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
        url: amz('trail hiking shoes boots outdoor'),
      },
      {
        name: 'Hydration Pack',
        description: 'Hands-free water carry — 2L minimum for Florida heat',
        url: amz('hydration pack backpack 2L hiking'),
      },
      {
        name: 'Trekking Poles',
        description: 'Reduce knee strain on longer Florida trails',
        url: amz('trekking poles lightweight collapsible'),
      },
      {
        name: 'Trail GPS',
        description: 'Florida trails can be disorienting — always navigate prepared',
        url: amz('handheld trail GPS hiking navigation'),
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
        url: amz('kayak paddle lightweight fiberglass'),
      },
      {
        name: 'Life Jacket (PFD)',
        description: 'Coast Guard approved — required on Florida waterways',
        url: amz('life jacket PFD Coast Guard approved kayaking'),
      },
      {
        name: 'Dry Bag (20L)',
        description: 'Keep gear waterproof — a necessity on the water',
        url: amz('dry bag 20L waterproof kayaking'),
      },
      {
        name: 'Waterproof Phone Case',
        description: 'Float-capable pouch for photos and navigation',
        url: amz('waterproof phone case float kayaking'),
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
        url: amz('snorkel mask set anti-fog wide view'),
      },
      {
        name: 'Water Shoes',
        description: 'Grip on rocky spring shorelines and riverbeds',
        url: amz('water shoes beach river rocky'),
      },
      {
        name: 'Rash Guard',
        description: 'UPF 50+ sun protection in and out of the water',
        url: amz('rash guard UPF 50 swimming'),
      },
      {
        name: 'Swim Fins',
        description: 'Extend your range in springs and coastal waters',
        url: amz('swim fins snorkeling'),
      },
      {
        name: 'Board Shorts / Swim Trunks',
        description: 'Quick-dry — doubles as a hiking short on the trail',
        url: amz('board shorts swim trunks quick dry'),
      },
      {
        name: 'Swimsuit',
        description: 'Chlorine & saltwater resistant for springs and coastal parks',
        url: amz('womens swimsuit one piece bikini outdoor'),
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
        url: amz('bike helmet adult trail cycling'),
      },
      {
        name: 'Cycling Gloves',
        description: 'Grip and comfort on Florida\'s long paved trails',
        url: amz('cycling gloves padded mountain bike'),
      },
      {
        name: 'Bike Water Bottle & Cage',
        description: 'Hydration access without stopping on the trail',
        url: amz('bike water bottle cage cycling'),
      },
      {
        name: 'Bike Repair Kit',
        description: 'Patch kit, tire levers, and multi-tool — don\'t get stranded',
        url: amz('bike repair kit patch tire lever multi tool'),
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
        url: amz('binoculars 8x42 bird watching wildlife'),
      },
      {
        name: 'Field Guide: Florida',
        description: 'Curated Florida hiking and nature guides for every region',
        url: amz('Florida birding wildlife field guide book'),
      },
      {
        name: 'Action Camera',
        description: 'Capture wildlife from a safe, respectful distance',
        url: amz('action camera waterproof outdoor'),
      },
      {
        name: 'Quick-Dry Hiking Pants',
        description: 'Lightweight, moisture-wicking for Florida\'s humid trails',
        url: amz('quick dry hiking pants lightweight'),
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
        url: amz('beach umbrella UPF 50 sand anchor'),
      },
      {
        name: 'Packable Beach Chair',
        description: 'Lightweight and sand-proof for all-day beach visits',
        url: amz('packable beach chair lightweight'),
      },
      {
        name: 'Dry Bag / Beach Bag',
        description: 'Keep sand and saltwater away from your gear',
        url: amz('dry bag beach waterproof tote'),
      },
      {
        name: 'Water Shoes',
        description: 'Protect feet on rocky and shell-covered Florida shorelines',
        url: amz('water shoes beach rocky shoreline'),
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
        url: amz('life jacket PFD Coast Guard approved boating'),
      },
      {
        name: 'Dry Bag (30L+)',
        description: 'Keep gear dry on the water — larger capacity for boat trips',
        url: amz('dry bag 30L waterproof boating'),
      },
      {
        name: 'Waterproof Phone Case',
        description: 'Navigation and photos on the water — float-capable pouch',
        url: amz('waterproof phone case float boating'),
      },
      {
        name: 'Marine Cooler',
        description: 'Keep drinks and catch cold on Florida\'s warm water days',
        url: amz('marine cooler insulated boat'),
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
        url: amz('dog harness padded trail hiking'),
      },
      {
        name: 'Dog Leash',
        description: '6ft max on Florida trails — durable and tangle-free',
        url: amz('dog leash 6ft durable trail'),
      },
      {
        name: 'Dog Life Jacket',
        description: 'Essential for paddle trips and water parks with dogs',
        url: amz('dog life jacket PFD kayaking'),
      },
      {
        name: 'Dog Gear & Accessories',
        description: 'Collapsible bowls, booties, and more for trail dogs',
        url: amz('dog trail gear collapsible bowl booties'),
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
