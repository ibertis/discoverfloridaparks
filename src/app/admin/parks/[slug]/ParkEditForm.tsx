'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, Trash2, Save, Plus, X } from 'lucide-react';

const PARK_TYPES = [
  'State Parks', 'National Parks', 'National Wildlife Refuge',
  'County Parks', 'Community Parks', 'Theme Parks', 'Water Parks',
  'Seasonal Attractions', 'National Estuarine Research Reserve',
  'Nature Preserve', 'Wildlife Refuge', 'State Forest', 'State Trail', 'Other',
];
const PARK_REGIONS = ['North Florida', 'Northeast Florida', 'Central Florida', 'Southwest Florida', 'Southeast Florida', 'South Florida', 'Northwest Florida / Panhandle', 'East Coast', 'West Coast'];
const PARK_STATUSES = ['Active', 'Closed', 'Seasonal', 'Under Renovation'];
const SEASONS = [
  { value: 'year_round', label: 'Year-Round' },
  { value: 'fall_winter', label: 'Fall & Winter' },
  { value: 'spring_fall', label: 'Spring & Fall' },
  { value: 'summer', label: 'Summer' },
  { value: 'spring', label: 'Spring' },
  { value: 'winter', label: 'Winter' },
  { value: 'fall', label: 'Fall' },
];
const DURATIONS = [
  { value: 'quick_stop', label: 'Quick Stop' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'full_day', label: 'Full Day' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'multi_day', label: 'Multi-Day' },
];
const CROWD_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];
const AGENCIES = [
  { value: 'nps', label: 'National Park Service' },
  { value: 'fws', label: 'U.S. Fish & Wildlife Service' },
  { value: 'usfs', label: 'U.S. Forest Service' },
  { value: 'fdep', label: 'Florida Dept. of Environmental Protection' },
  { value: 'city', label: 'City / Municipal' },
  { value: 'county', label: 'County' },
  { value: 'private', label: 'Private' },
];
const TRAIL_DIFFICULTIES = ['Easy', 'Moderate', 'Hard', 'Strenuous'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Year-Round'];

interface Amenities {
  id?: string;
  park_id?: string;
  dog_friendly: boolean;
  camping_available: boolean;
  swimming_allowed: boolean;
  fishing_allowed: boolean;
  hiking_available: boolean;
  biking_available: boolean;
  horseback_riding: boolean;
  hunting_allowed: boolean;
  paddling_available: boolean;
  boat_launch: boolean;
  picnic_areas: boolean;
  visitor_center: boolean;
  wheelchair_accessible: boolean;
}

interface Trail {
  id?: string;
  name: string;
  difficulty: string;
  length_miles: number | null;
  description: string;
  sort_order: number;
}

interface FunFact {
  id?: string;
  fact: string;
  sort_order: number;
}

interface SeasonalEvent {
  id?: string;
  event_name: string;
  month: string;
  description: string;
  sort_order: number;
}

interface Park {
  id?: string;
  slug: string;
  name: string;
  park_types: string[] | null;
  park_regions: string[] | null;
  county: string | null;
  park_status: string | null;
  city: string | null;
  address: string | null;
  zip_code: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  google_rating: number | null;
  google_maps_link: string | null;
  operating_hours: string | null;
  featured_image_url: string | null;
  gallery_urls: string[] | null;
  latitude: number | null;
  longitude: number | null;
  short_description: string | null;
  full_description: string | null;
  visitor_tips: string | null;
  wildlife_summary: string | null;
  safety_notes: string | null;
  parking_info: string | null;
  terrain: string | null;
  entrance_fee: string | null;
  is_featured: boolean | null;
  reservation_required: boolean | null;
  camping_url: string | null;
  reservation_url: string | null;
  managing_agency: string | null;
  best_season: string | null;
  typical_visit_duration: string | null;
  crowd_level: string | null;
  instagram_hashtag: string | null;
  nearby_cities: string | null;
  year_established: number | null;
  park_size_acres: number | null;
  distance_from_miami: number | null;
  distance_from_orlando: number | null;
  distance_from_tampa: number | null;
  seo_title: string | null;
  seo_description: string | null;
  park_amenities?: Amenities | Amenities[] | null;
  park_trails?: Trail[] | null;
  park_fun_facts?: FunFact[] | null;
  park_seasonal_events?: SeasonalEvent[] | null;
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-semibold text-[#413734] mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm text-[#413734] outline-none focus:border-[#ff7044] transition bg-white';
const textareaCls = `${inputCls} resize-y`;

const EMPTY_AMENITIES: Amenities = {
  dog_friendly: false, camping_available: false, swimming_allowed: false,
  fishing_allowed: false, hiking_available: false, biking_available: false,
  horseback_riding: false, hunting_allowed: false, paddling_available: false, boat_launch: false,
  picnic_areas: false, visitor_center: false, wheelchair_accessible: false,
};

function normalizeAmenities(raw: Amenities | Amenities[] | null | undefined): Amenities {
  if (!raw) return EMPTY_AMENITIES;
  const a = Array.isArray(raw) ? raw[0] : raw;
  return a ?? EMPTY_AMENITIES;
}

export default function ParkEditForm({ park, role }: { park: Park | null; role?: string | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const isNew = !park?.id;

  const [form, setForm] = useState<Park>(park ?? {
    slug: '', name: '', park_types: [], park_regions: [], county: null, park_status: null,
    city: null, address: null, zip_code: null, phone: null, website: null, email: null,
    google_rating: null, google_maps_link: null, operating_hours: null, featured_image_url: null,
    gallery_urls: null, latitude: null, longitude: null,
    short_description: null, full_description: null, visitor_tips: null,
    wildlife_summary: null, safety_notes: null, parking_info: null, terrain: null,
    entrance_fee: null, is_featured: false, reservation_required: false,
    camping_url: null, reservation_url: null, managing_agency: null,
    best_season: null, typical_visit_duration: null, crowd_level: null,
    instagram_hashtag: null, nearby_cities: null,
    year_established: null, park_size_acres: null,
    distance_from_miami: null, distance_from_orlando: null, distance_from_tampa: null,
    seo_title: null, seo_description: null,
  });

  const [amenities, setAmenities] = useState<Amenities>(normalizeAmenities(park?.park_amenities));
  const [trails, setTrails] = useState<Trail[]>(park?.park_trails ?? []);
  const [facts, setFacts] = useState<FunFact[]>(park?.park_fun_facts ?? []);
  const [events, setEvents] = useState<SeasonalEvent[]>(park?.park_seasonal_events ?? []);

  function set(field: keyof Park, value: unknown) {
    setForm(f => ({ ...f, [field]: value === '' ? null : value }));
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${form.slug || 'park'}-${Date.now()}.${ext}`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('fileName', fileName);
    const res = await fetch('/admin/api/upload-park-photo', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) { showToast(`Upload failed: ${json.error}`, false); setUploadingPhoto(false); return; }
    set('featured_image_url', json.url);
    setUploadingPhoto(false);
    showToast('Photo uploaded');
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGallery(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${form.slug || 'park'}-gallery-${Date.now()}.${ext}`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('fileName', fileName);
    const res = await fetch('/admin/api/upload-park-photo', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) { showToast(`Upload failed: ${json.error}`, false); setUploadingGallery(false); return; }
    set('gallery_urls', [...(form.gallery_urls ?? []), json.url]);
    setUploadingGallery(false);
    showToast('Photo added');
    if (galleryFileRef.current) galleryFileRef.current.value = '';
  }

  function removeGalleryPhoto(url: string) {
    set('gallery_urls', (form.gallery_urls ?? []).filter(u => u !== url));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch('/admin/api/save-park', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ park: form, amenities, trails, facts, events }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { showToast(json.error, false); return; }

    if (isNew) {
      router.push(`/admin/parks/${json.slug}`);
    } else {
      showToast('Saved!');
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch('/admin/api/save-park', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: park!.id }),
    });
    router.push('/admin/parks');
  }

  return (
    <form onSubmit={handleSave}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-semibold shadow-lg text-white transition ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-6">

        {/* ── Photo ── */}
        <Section title="Featured Photo">
          <div className="flex items-start gap-4">
            {form.featured_image_url ? (
              <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-[#eeeeee] shrink-0">
                <Image src={form.featured_image_url} alt="" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-40 h-28 rounded-lg bg-[#f7f5f2] border border-[#eeeeee] flex items-center justify-center shrink-0">
                <span className="text-xs text-[#a6967c]">No photo</span>
              </div>
            )}
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingPhoto}
                className="flex items-center gap-2 text-sm font-semibold border border-[#dfdfdf] rounded-lg px-4 py-2 hover:bg-[#f7f5f2] transition disabled:opacity-50">
                <Upload size={14} />
                {uploadingPhoto ? 'Uploading…' : form.featured_image_url ? 'Replace photo' : 'Upload photo'}
              </button>
              {form.featured_image_url && (
                <button type="button" onClick={() => set('featured_image_url', null)}
                  className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition">
                  <Trash2 size={12} /> Remove
                </button>
              )}
              <p className="text-xs text-[#a6967c]">JPG or PNG, max 10 MB</p>
            </div>
          </div>
        </Section>

        {/* ── Gallery Photos ── */}
        <Section title="Gallery Photos">
          <div className="flex flex-wrap gap-3 mb-3">
            {(form.gallery_urls ?? []).map(url => (
              <div key={url} className="relative w-40 h-28 rounded-lg overflow-hidden border border-[#eeeeee] shrink-0 group">
                <Image src={url} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeGalleryPhoto(url)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <input ref={galleryFileRef} type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
          <button
            type="button"
            onClick={() => galleryFileRef.current?.click()}
            disabled={uploadingGallery}
            className="flex items-center gap-2 text-sm font-semibold border border-[#dfdfdf] rounded-lg px-4 py-2 hover:bg-[#f7f5f2] transition disabled:opacity-50"
          >
            <Plus size={14} />
            {uploadingGallery ? 'Uploading…' : 'Add Photo'}
          </button>
          <p className="text-xs text-[#a6967c] mt-2">JPG or PNG, max 10 MB. Hover a photo to remove it.</p>
        </Section>

        {/* ── Core Info ── */}
        <Section title="Core Info" grid>
          <Field label="Park Name *">
            <input required value={form.name ?? ''} onChange={e => set('name', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Slug *">
            <input required value={form.slug ?? ''} onChange={e => set('slug', e.target.value)} className={inputCls} placeholder="everglades-national-park" />
          </Field>
          <Field label="Park Type">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PARK_TYPES.map(t => {
                const checked = (form.park_types ?? []).includes(t);
                return (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: '#413734' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const current = form.park_types ?? [];
                        set('park_types', checked ? current.filter(x => x !== t) : [...current, t]);
                      }}
                      style={{ accentColor: '#ff7044', width: 15, height: 15 }}
                    />
                    {t}
                  </label>
                );
              })}
            </div>
          </Field>
          <Field label="Region">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PARK_REGIONS.map(r => {
                const checked = (form.park_regions ?? []).includes(r);
                return (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: '#413734' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const current = form.park_regions ?? [];
                        set('park_regions', checked ? current.filter(x => x !== r) : [...current, r]);
                      }}
                      style={{ accentColor: '#ff7044', width: 15, height: 15 }}
                    />
                    {r}
                  </label>
                );
              })}
            </div>
          </Field>
          <Field label="Park Status">
            <select value={form.park_status ?? ''} onChange={e => set('park_status', e.target.value)} className={inputCls}>
              <option value="">— Select —</option>
              {PARK_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="County">
            <input value={form.county ?? ''} onChange={e => set('county', e.target.value)} className={inputCls} placeholder="Miami-Dade" />
          </Field>
          <Field label="City">
            <input value={form.city ?? ''} onChange={e => set('city', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Entrance Fee">
            <input value={form.entrance_fee ?? ''} onChange={e => set('entrance_fee', e.target.value)} className={inputCls} placeholder="Free, $6/vehicle" />
          </Field>
          <Field label="Year Established">
            <input type="number" min="1800" max="2099" value={form.year_established ?? ''} onChange={e => set('year_established', e.target.value ? parseInt(e.target.value) : null)} className={inputCls} />
          </Field>
          <Field label="Size (acres)">
            <input type="number" step="0.1" value={form.park_size_acres ?? ''} onChange={e => set('park_size_acres', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} />
          </Field>
          <div className="col-span-2 flex flex-wrap gap-6 pt-1">
            <Checkbox id="featured" checked={!!form.is_featured} onChange={v => set('is_featured', v)} label="Featured park" />
            <Checkbox id="reservation" checked={!!form.reservation_required} onChange={v => set('reservation_required', v)} label="Reservation required" />
          </div>
        </Section>

        {/* ── Amenities ── */}
        <Section title="Amenities & Activities">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              ['dog_friendly', 'Dog Friendly'],
              ['camping_available', 'Camping'],
              ['swimming_allowed', 'Swimming'],
              ['fishing_allowed', 'Fishing'],
              ['hiking_available', 'Hiking'],
              ['biking_available', 'Biking'],
              ['horseback_riding', 'Horseback Riding'],
              ['hunting_allowed', 'Hunting'],
              ['paddling_available', 'Paddling'],
              ['boat_launch', 'Boat Launch'],
              ['picnic_areas', 'Picnic Areas'],
              ['visitor_center', 'Visitor Center'],
              ['wheelchair_accessible', 'Wheelchair Accessible'],
            ] as [keyof Amenities, string][]).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-[#413734] font-medium cursor-pointer">
                <input type="checkbox" checked={!!amenities[key]} onChange={e => setAmenities(a => ({ ...a, [key]: e.target.checked }))} className="accent-[#ff7044]" />
                {label}
              </label>
            ))}
          </div>
        </Section>

        {/* ── Descriptions ── */}
        <Section title="Descriptions">
          <Field label="Short Description (≤160 chars)">
            <textarea rows={2} value={form.short_description ?? ''} onChange={e => set('short_description', e.target.value)} className={textareaCls} maxLength={200} />
          </Field>
          <Field label="Full Description">
            <textarea rows={6} value={form.full_description ?? ''} onChange={e => set('full_description', e.target.value)} className={textareaCls} />
          </Field>
          <Field label="Visitor Tips">
            <textarea rows={4} value={form.visitor_tips ?? ''} onChange={e => set('visitor_tips', e.target.value)} className={textareaCls} placeholder="• Tip one&#10;• Tip two" />
          </Field>
          <Field label="Wildlife Summary">
            <textarea rows={3} value={form.wildlife_summary ?? ''} onChange={e => set('wildlife_summary', e.target.value)} className={textareaCls} />
          </Field>
          <Field label="Safety Notes">
            <textarea rows={3} value={form.safety_notes ?? ''} onChange={e => set('safety_notes', e.target.value)} className={textareaCls} />
          </Field>
          <Field label="Terrain">
            <input value={form.terrain ?? ''} onChange={e => set('terrain', e.target.value)} className={inputCls} placeholder="Flat, hilly, wetlands, beach…" />
          </Field>
        </Section>

        {/* ── Visit Details ── */}
        <Section title="Visit Details" grid>
          <Field label="Best Season">
            <select value={form.best_season ?? ''} onChange={e => set('best_season', e.target.value)} className={inputCls}>
              <option value="">— Select —</option>
              {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Typical Visit Duration">
            <select value={form.typical_visit_duration ?? ''} onChange={e => set('typical_visit_duration', e.target.value)} className={inputCls}>
              <option value="">— Select —</option>
              {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Field>
          <Field label="Crowd Level">
            <select value={form.crowd_level ?? ''} onChange={e => set('crowd_level', e.target.value)} className={inputCls}>
              <option value="">— Select —</option>
              {CROWD_LEVELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Managing Agency">
            <select value={form.managing_agency ?? ''} onChange={e => set('managing_agency', e.target.value)} className={inputCls}>
              <option value="">— Select —</option>
              {AGENCIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </Field>
          <Field label="Nearby Cities">
            <input value={form.nearby_cities ?? ''} onChange={e => set('nearby_cities', e.target.value)} className={inputCls} placeholder="Miami, Fort Lauderdale" />
          </Field>
          <Field label="Instagram Hashtag">
            <input value={form.instagram_hashtag ?? ''} onChange={e => set('instagram_hashtag', e.target.value)} className={inputCls} placeholder="#evergladesnps" />
          </Field>
        </Section>

        {/* ── Contact & Hours ── */}
        <Section title="Contact & Hours" grid>
          <Field label="Address">
            <input value={form.address ?? ''} onChange={e => set('address', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Zip Code">
            <input value={form.zip_code ?? ''} onChange={e => set('zip_code', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Phone">
            <input value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Website">
            <input type="url" value={form.website ?? ''} onChange={e => set('website', e.target.value)} className={inputCls} placeholder="https://" />
          </Field>
          <Field label="Google Maps Link">
            <input type="url" value={form.google_maps_link ?? ''} onChange={e => set('google_maps_link', e.target.value)} className={inputCls} placeholder="https://maps.google.com/…" />
          </Field>
          <Field label="Google Rating">
            <input type="number" step="0.1" min="0" max="5" value={form.google_rating ?? ''} onChange={e => set('google_rating', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} />
          </Field>
          <Field label="Parking Info">
            <input value={form.parking_info ?? ''} onChange={e => set('parking_info', e.target.value)} className={inputCls} placeholder="Free parking lot, limited spaces" />
          </Field>
          <Field label="Camping URL" span2>
            <input type="url" value={form.camping_url ?? ''} onChange={e => set('camping_url', e.target.value)} className={inputCls} placeholder="https://" />
          </Field>
          <Field label="Reservation URL" span2>
            <input type="url" value={form.reservation_url ?? ''} onChange={e => set('reservation_url', e.target.value)} className={inputCls} placeholder="https://" />
          </Field>
          <Field label="Operating Hours" span2>
            <textarea rows={4} value={form.operating_hours ?? ''} onChange={e => set('operating_hours', e.target.value)} className={textareaCls} placeholder="Monday: 8:00 AM – 5:00 PM&#10;Tuesday: 8:00 AM – 5:00 PM" />
          </Field>
        </Section>

        {/* ── Location ── */}
        <Section title="Location" grid>
          <Field label="Latitude">
            <input type="number" step="any" value={form.latitude ?? ''} onChange={e => set('latitude', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} />
          </Field>
          <Field label="Longitude">
            <input type="number" step="any" value={form.longitude ?? ''} onChange={e => set('longitude', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} />
          </Field>
          <Field label="Distance from Miami (mi)">
            <input type="number" step="1" value={form.distance_from_miami ?? ''} onChange={e => set('distance_from_miami', e.target.value ? parseInt(e.target.value) : null)} className={inputCls} />
          </Field>
          <Field label="Distance from Orlando (mi)">
            <input type="number" step="1" value={form.distance_from_orlando ?? ''} onChange={e => set('distance_from_orlando', e.target.value ? parseInt(e.target.value) : null)} className={inputCls} />
          </Field>
          <Field label="Distance from Tampa (mi)">
            <input type="number" step="1" value={form.distance_from_tampa ?? ''} onChange={e => set('distance_from_tampa', e.target.value ? parseInt(e.target.value) : null)} className={inputCls} />
          </Field>
        </Section>

        {/* ── SEO ── */}
        <Section title="SEO">
          <Field label="SEO Title">
            <input value={form.seo_title ?? ''} onChange={e => set('seo_title', e.target.value)} className={inputCls} placeholder="Defaults to park name if blank" />
          </Field>
          <Field label="SEO Description">
            <textarea rows={3} value={form.seo_description ?? ''} onChange={e => set('seo_description', e.target.value)} className={textareaCls} placeholder="Defaults to short description if blank" />
          </Field>
        </Section>

        {/* ── Trails ── (existing parks only) */}
        {!isNew && (
          <Section title="Trails">
            <div className="space-y-3">
              {trails.map((trail, i) => (
                <div key={i} className="border border-[#eeeeee] rounded-lg p-4 grid grid-cols-2 gap-3 relative">
                  <button type="button" onClick={() => setTrails(t => t.filter((_, j) => j !== i))}
                    className="absolute top-3 right-3 text-[#a6967c] hover:text-red-500 transition">
                    <X size={14} />
                  </button>
                  <Field label="Trail Name">
                    <input value={trail.name} onChange={e => setTrails(t => t.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} className={inputCls} />
                  </Field>
                  <Field label="Difficulty">
                    <select value={trail.difficulty} onChange={e => setTrails(t => t.map((x, j) => j === i ? { ...x, difficulty: e.target.value } : x))} className={inputCls}>
                      <option value="">— Select —</option>
                      {TRAIL_DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field label="Length (miles)">
                    <input type="number" step="0.1" value={trail.length_miles ?? ''} onChange={e => setTrails(t => t.map((x, j) => j === i ? { ...x, length_miles: e.target.value ? parseFloat(e.target.value) : null } : x))} className={inputCls} />
                  </Field>
                  <Field label="Description" span2>
                    <textarea rows={2} value={trail.description} onChange={e => setTrails(t => t.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} className={textareaCls} />
                  </Field>
                </div>
              ))}
              <button type="button" onClick={() => setTrails(t => [...t, { name: '', difficulty: '', length_miles: null, description: '', sort_order: t.length }])}
                className="flex items-center gap-2 text-sm font-semibold text-[#ff7044] hover:text-[#e85a2e] transition">
                <Plus size={14} /> Add Trail
              </button>
            </div>
          </Section>
        )}

        {/* ── Fun Facts ── (existing parks only) */}
        {!isNew && (
          <Section title="Fun Facts">
            <div className="space-y-3">
              {facts.map((fact, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#ff7044] text-white text-xs font-bold flex items-center justify-center mt-2.5">{i + 1}</span>
                  <textarea rows={2} value={fact.fact} onChange={e => setFacts(f => f.map((x, j) => j === i ? { ...x, fact: e.target.value } : x))} className={`${textareaCls} flex-1`} />
                  <button type="button" onClick={() => setFacts(f => f.filter((_, j) => j !== i))}
                    className="text-[#a6967c] hover:text-red-500 transition mt-2.5">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setFacts(f => [...f, { fact: '', sort_order: f.length }])}
                className="flex items-center gap-2 text-sm font-semibold text-[#ff7044] hover:text-[#e85a2e] transition">
                <Plus size={14} /> Add Fun Fact
              </button>
            </div>
          </Section>
        )}

        {/* ── Seasonal Events ── (existing parks only) */}
        {!isNew && (
          <Section title="Seasonal Events">
            <div className="space-y-3">
              {events.map((evt, i) => (
                <div key={i} className="border border-[#eeeeee] rounded-lg p-4 grid grid-cols-2 gap-3 relative">
                  <button type="button" onClick={() => setEvents(e => e.filter((_, j) => j !== i))}
                    className="absolute top-3 right-3 text-[#a6967c] hover:text-red-500 transition">
                    <X size={14} />
                  </button>
                  <Field label="Event Name">
                    <input value={evt.event_name} onChange={e => setEvents(ev => ev.map((x, j) => j === i ? { ...x, event_name: e.target.value } : x))} className={inputCls} />
                  </Field>
                  <Field label="Month">
                    <select value={evt.month} onChange={e => setEvents(ev => ev.map((x, j) => j === i ? { ...x, month: e.target.value } : x))} className={inputCls}>
                      <option value="">— Select —</option>
                      {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Description" span2>
                    <textarea rows={2} value={evt.description} onChange={e => setEvents(ev => ev.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} className={textareaCls} />
                  </Field>
                </div>
              ))}
              <button type="button" onClick={() => setEvents(e => [...e, { event_name: '', month: '', description: '', sort_order: e.length }])}
                className="flex items-center gap-2 text-sm font-semibold text-[#ff7044] hover:text-[#e85a2e] transition">
                <Plus size={14} /> Add Event
              </button>
            </div>
          </Section>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center justify-between pb-8">
          <div>
            {!isNew && role === 'admin' && (
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition disabled:opacity-50">
                <Trash2 size={14} />
                {deleting ? 'Deleting…' : 'Delete park'}
              </button>
            )}
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#ff7044] hover:bg-[#e85a2e] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50">
            <Save size={15} />
            {saving ? 'Saving…' : isNew ? 'Create park' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children, grid }: { title: string; children: React.ReactNode; grid?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-[#eeeeee] p-5">
      <h2 className="text-sm font-bold text-[#362f35] mb-4">{title}</h2>
      {grid ? <div className="grid grid-cols-2 gap-4">{children}</div> : <div className="space-y-4">{children}</div>}
    </div>
  );
}

function Checkbox({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} className="accent-[#ff7044]" />
      <label htmlFor={id} className="text-sm text-[#413734] font-medium">{label}</label>
    </div>
  );
}
