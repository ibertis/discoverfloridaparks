'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Save, Trash2, Upload } from 'lucide-react';

const ACTIVITY_TYPES = [
  'Airboat Tours', 'Biking & Cycling', 'Boat Tours & Rentals',
  'Camping Experiences', 'Fishing', 'Guided Hiking & Nature Walks',
  'Horseback Riding', 'Kayaking & Canoeing', 'Manatee Encounters',
  'Paddleboarding & Water Sports', 'Photography & Birding Tours',
  'Snorkeling & Diving', 'Sunset & Scenic Cruises', 'Swimming',
  'Theme Park Experiences', 'Water Park Experiences', 'Wildlife & Eco Tours',
];

const ALL_REGIONS = [
  'Northwest Florida / Panhandle',
  'North Florida', 'North Florida, West Coast', 'North Florida, East Coast',
  'Northeast Florida',
  'Central Florida', 'Central Florida, West Coast', 'Central Florida, East Coast',
  'East Coast', 'West Coast',
  'Southwest Florida', 'Southeast Florida',
  'South Florida', 'South Florida, The Keys',
];

const AFFILIATE_SOURCES = ['viator', 'getyourguide', 'direct', 'other'];

interface Experience {
  id?: string;
  name: string;
  provider: string | null;
  description: string | null;
  activity_type: string;
  regions: string[];
  affiliate_url: string;
  affiliate_source: string;
  price_from: number | null;
  price_currency: string;
  review_count: number;
  rating: number | null;
  duration_hours: number | null;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  homepage_order: number | null;
  notes: string | null;
}

const inputCls = 'w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm text-[#413734] outline-none focus:border-[#ff7044] transition bg-white';

export default function ExperienceEditForm({ experience }: { experience: Experience | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [form, setForm] = useState<Experience>({
    name: '',
    provider: null,
    description: null,
    activity_type: '',
    regions: [],
    affiliate_url: '',
    affiliate_source: 'viator',
    price_from: null,
    price_currency: 'USD',
    review_count: 0,
    rating: null,
    duration_hours: null,
    image_url: null,
    is_active: true,
    is_featured: false,
    homepage_order: null,
    notes: null,
    ...experience,
  });

  function set(field: keyof Experience, value: unknown) {
    setForm(f => ({ ...f, [field]: value === '' ? null : value }));
  }

  function toggleRegion(r: string) {
    setForm(f => ({
      ...f,
      regions: f.regions.includes(r) ? f.regions.filter(x => x !== r) : [...f.regions, r],
    }));
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `experience-${Date.now()}.${ext}`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('fileName', fileName);
    const res = await fetch('/admin/api/upload-experience-photo', { method: 'POST', body: fd });
    const json = await res.json();
    setUploadingPhoto(false);
    if (!res.ok) { showToast(`Upload failed: ${json.error}`, false); return; }
    set('image_url', json.url);
    showToast('Photo uploaded');
  }

  async function handleSave() {
    if (!form.name.trim()) { showToast('Name is required', false); return; }
    if (!form.activity_type) { showToast('Activity type is required', false); return; }
    if (!form.affiliate_url.trim()) { showToast('Affiliate URL is required', false); return; }
    if (form.regions.length === 0) { showToast('Select at least one region', false); return; }
    setSaving(true);
    try {
      const body = { ...form, id: experience?.id };
      const res = await fetch('/admin/api/save-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.error ?? 'Save failed', false); return; }
      showToast('Saved');
      if (!experience?.id && json.id) {
        router.push(`/admin/experiences/${json.id}`);
      } else {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!experience?.id) return;
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch('/admin/api/save-experience', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: experience.id }),
      });
      if (!res.ok) { showToast('Delete failed', false); return; }
      router.push('/admin/experiences');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">

      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-lg ${toast.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Name + Provider */}
      <div className="bg-white rounded-xl border border-[#eeeeee] p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#362f35]">Experience Info</h2>
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Crystal River Manatee Swim Tour" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Provider / Operator</label>
          <input value={form.provider ?? ''} onChange={e => set('provider', e.target.value)} className={inputCls} placeholder="Fun2Dive, Wild Florida Airboats…" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Description</label>
          <textarea rows={4} value={form.description ?? ''} onChange={e => set('description', e.target.value)}
            className={`${inputCls} resize-y`} placeholder="Compelling 2-3 sentence description shown on park pages…" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Photo <span className="normal-case font-normal text-[#a6967c]">(shown as round image on homepage when Featured)</span></label>
          <div className="flex items-start gap-4">
            {form.image_url ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border border-[#eeeeee] shrink-0">
                <Image src={form.image_url} alt="" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#f7f5f2] border border-[#eeeeee] flex items-center justify-center shrink-0">
                <span className="text-xs text-[#a6967c] text-center leading-tight px-2">No photo</span>
              </div>
            )}
            <div className="space-y-2 pt-1">
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingPhoto}
                className="flex items-center gap-2 text-sm font-semibold border border-[#dfdfdf] rounded-lg px-4 py-2 hover:bg-[#f7f5f2] transition disabled:opacity-50">
                <Upload size={14} />
                {uploadingPhoto ? 'Uploading…' : form.image_url ? 'Replace photo' : 'Upload photo'}
              </button>
              {form.image_url && (
                <button type="button" onClick={() => set('image_url', null)}
                  className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition">
                  <Trash2 size={12} /> Remove
                </button>
              )}
              <p className="text-xs text-[#a6967c]">JPG or PNG, max 10 MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Type */}
      <div className="bg-white rounded-xl border border-[#eeeeee] p-5">
        <h2 className="text-sm font-bold text-[#362f35] mb-4">Activity Type *</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ACTIVITY_TYPES.map(t => (
            <label key={t} className="flex items-center gap-2 text-sm text-[#413734] cursor-pointer">
              <input type="radio" name="activity_type" value={t} checked={form.activity_type === t}
                onChange={() => set('activity_type', t)} className="accent-[#ff7044]" />
              {t}
            </label>
          ))}
        </div>
      </div>

      {/* Regions */}
      <div className="bg-white rounded-xl border border-[#eeeeee] p-5">
        <h2 className="text-sm font-bold text-[#362f35] mb-1">Regions *</h2>
        <p className="text-xs text-[#a6967c] mb-4">This experience will appear on park pages that share at least one of these regions.</p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_REGIONS.map(r => (
            <label key={r} className="flex items-center gap-2 text-sm text-[#413734] cursor-pointer">
              <input type="checkbox" checked={form.regions.includes(r)} onChange={() => toggleRegion(r)} className="accent-[#ff7044]" />
              {r}
            </label>
          ))}
        </div>
      </div>

      {/* Affiliate */}
      <div className="bg-white rounded-xl border border-[#eeeeee] p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#362f35]">Affiliate Details</h2>
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Affiliate URL * (full tracked link)</label>
          <input value={form.affiliate_url} onChange={e => set('affiliate_url', e.target.value)} className={inputCls} placeholder="https://www.viator.com/tours/…?pid=P00300517&…" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Affiliate Source</label>
            <select value={form.affiliate_source} onChange={e => set('affiliate_source', e.target.value)} className={inputCls}>
              {AFFILIATE_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Price From (USD)</label>
            <input type="number" step="0.01" min="0" value={form.price_from ?? ''} onChange={e => set('price_from', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} placeholder="45.00" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-[#eeeeee] p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#362f35]">Viator Stats</h2>
        <p className="text-xs text-[#a6967c] -mt-2">Copy from the Viator listing. Used for the star rating and review count displayed on park pages.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Rating (0–5)</label>
            <input type="number" step="0.1" min="0" max="5" value={form.rating ?? ''} onChange={e => set('rating', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} placeholder="4.7" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Review Count</label>
            <input type="number" step="1" min="0" value={form.review_count ?? 0} onChange={e => set('review_count', parseInt(e.target.value) || 0)} className={inputCls} placeholder="3038" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Duration (hours)</label>
            <input type="number" step="0.5" min="0" value={form.duration_hours ?? ''} onChange={e => set('duration_hours', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} placeholder="3.0" />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-[#eeeeee] p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#362f35]">Settings</h2>
        <div className="flex gap-6 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-[#413734] cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="accent-[#ff7044] w-4 h-4" />
            Active (shows on park pages)
          </label>
          <label className="flex items-center gap-2 text-sm text-[#413734] cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="accent-[#ff7044] w-4 h-4" />
            Featured (eligible for homepage)
          </label>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">
            Homepage Slot <span className="normal-case font-normal text-[#a6967c]">— pin to a guaranteed position (Featured must be on)</span>
          </label>
          <select
            value={form.homepage_order ?? ''}
            onChange={e => set('homepage_order', e.target.value === '' ? null : parseInt(e.target.value))}
            className={inputCls}
            style={{ maxWidth: 240 }}
          >
            <option value="">Auto (ranked by rating)</option>
            <option value="1">Slot 1 — always shows, shown first</option>
            <option value="2">Slot 2 — always shows, shown second</option>
            <option value="3">Slot 3 — always shows, shown third</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Internal Notes</label>
          <textarea rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)}
            className={`${inputCls} resize-y`} placeholder="Seasonal notes, conversion info, anything for your reference only…" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pb-8">
        <div>
          {experience?.id && (
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition disabled:opacity-50">
              <Trash2 size={14} />
              {deleting ? 'Deleting…' : 'Delete experience'}
            </button>
          )}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[#ff7044] hover:bg-[#e85a2e] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50">
          <Save size={15} />
          {saving ? 'Saving…' : experience?.id ? 'Save changes' : 'Create experience'}
        </button>
      </div>
    </div>
  );
}
