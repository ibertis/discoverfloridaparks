export interface GearItem {
  name: string;
  description: string;
  url: string;
}

export interface GearCategory {
  label: string;
  amenityKey: string;
  items: GearItem[];
}

export const UNIVERSAL_ITEMS: GearItem[] = [
  { name: 'Sunscreen SPF 50+', description: 'Reef-safe, broad spectrum', url: 'https://amzn.to/4nbDQdg' },
];

export const GEAR_CATEGORIES: GearCategory[] = [
  {
    label: 'Camping Gear',
    amenityKey: 'camping_available',
    items: [
      { name: '2-Person Backpacking Tent',  description: 'Lightweight & waterproof',     url: 'https://amzn.to/4tZoCdU' },
      { name: 'Sleeping Bag (40°F rated)',  description: 'Compact for warm nights',      url: 'https://amzn.to/49Aqy4o' },
      { name: 'Sleeping Pad',               description: 'Insulated foam or inflatable',  url: 'https://amzn.to/4d8ZiuY' },
      { name: 'Headlamp',                   description: 'Hands-free trail lighting',     url: 'https://amzn.to/3RtE83m' },
    ],
  },
  {
    label: 'Paddling Gear',
    amenityKey: 'paddling_available',
    items: [
      { name: 'Kayak Paddle',               description: 'Lightweight aluminum',          url: 'https://amzn.to/4tV8jPm' },
      { name: 'Life Jacket (PFD)',          description: 'Coast Guard approved',          url: 'https://amzn.to/4niXBzy' },
      { name: 'Dry Bag (20L)',              description: 'Keeps gear waterproof',         url: 'https://amzn.to/4eBEcrE' },
      { name: 'Waterproof Phone Case',      description: 'Float-capable pouch',          url: 'https://amzn.to/3PfMdYJ' },
    ],
  },
  {
    label: 'Swimming & Snorkeling Gear',
    amenityKey: 'swimming_allowed',
    items: [
      { name: 'Snorkel Mask Set',           description: 'Anti-fog, wide view',          url: 'https://amzn.to/3Roj9im' },
      { name: 'Water Shoes',                description: 'Grip on rocky shorelines',     url: 'https://amzn.to/49FdHOr' },
      { name: 'Rash Guard',                 description: 'UPF 50+ sun protection',       url: 'https://amzn.to/4tmNMCc' },
      { name: 'Mesh Beach Bag',             description: 'Sand drains straight through',  url: 'https://amzn.to/4dfo4ty' },
    ],
  },
  {
    label: 'Fishing Gear',
    amenityKey: 'fishing_allowed',
    items: [
      { name: 'Spinning Rod & Reel Combo',     description: 'Great for freshwater fishing', url: 'https://amzn.to/4ewl4et' },
      { name: 'Tackle Box Set',                description: 'Lures, hooks & sinkers',       url: 'https://amzn.to/4uw48cG' },
      { name: 'Polarized Fishing Sunglasses',  description: 'See below the surface',        url: 'https://amzn.to/4u47HqS' },
      { name: 'Fishing Backpack',              description: 'Rod holders + waterproof',     url: 'https://amzn.to/4nfUMzg' },
    ],
  },
  {
    label: 'Hiking Gear',
    amenityKey: 'hiking_available',
    items: [
      { name: 'Trail Running Shoes',  description: 'Grip & support on Florida trails',  url: 'https://amzn.to/49wJOzJ' },
      { name: 'Hydration Pack (2L)',  description: 'Hands-free water on the trail',     url: 'https://amzn.to/4we76El' },
      { name: 'Trekking Poles',       description: 'Reduce knee strain',                url: 'https://amzn.to/4fcoRxH' },
      { name: 'Insect Repellent',     description: 'DEET-free, long-lasting',           url: 'https://amzn.to/3RdmsZI' },
    ],
  },
];
