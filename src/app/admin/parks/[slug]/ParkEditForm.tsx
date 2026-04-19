'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, Trash2, Save } from 'lucide-react';

const PARK_TYPES = ['State Parks', 'National Parks', 'County Parks', 'Theme Parks', 'Water Parks', 'Nature Preserve', 'Wildlife Refuge', 'State Forest', 'State Trail', 'Other'];
const PARK_REGIONS = ['North Florida', 'Northeast Florida', 'Central Florida', 'Southwest Florida', 'Southeast Florida', 'South Florida', 'Northwest Florida / Panhandle', 'East Coast', 'West Coast'];

interface Park {
  id?: string;
  slug: string;
  name: string;
  park_type: string | null;
  park_region: string | null;
  city: string | null;
  address: string | null;
  zip_code: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  google_rating: number | null;
  operating_hours: string | null;
  featured_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  short_description: string | null;
  full_description: string | null;
  visitor_tips: string | null;
  wildlife_summary: string | null;
  entrance_fee: string | null;
  is_featured: boolean | null;
  managing_agency: string | null;
  best_season: string | null;
  typical_visit_duration: string | null;
  instagram_hashtag: string | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#413734] mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm text-[#413734] outline-none focus:border-[#ff7044] transition bg-white';
const textareaCls = `${inputCls} resize-y`;

export default function ParkEditForm({ park }: { park: Park | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const isNew = !park?.id;
  const [form, setForm] = useState<Park>(park ?? {
    slug: '', name: '', park_type: null, park_region: null,
    city: null, address: null, zip_code: null, phone: null, website: null, email: null,
    google_rating: null, operating_hours: null, featured_image_url: null,
    latitude: null, longitude: null, short_description: null, full_description: null,
    visitor_tips: null, wildlife_summary: null, entrance_fee: null,
    is_featured: false, managing_agency: null, best_season: null,
    typical_visit_duration: null, instagram_hashtag: null,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  function set(field: keyof Park, value: unknown) {
    setForm(f => ({ ...f, [field]: value || null }));
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
    const fileName = `${form.slug || Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('park-photos')
      .upload(fileName, file, { upsert: true, contentType: file.type });

    if (error) {
      showToast(`Upload failed: ${error.message}`, false);
      setUploadingPhoto(false);
      return;
    }

    const { data } = supabase.storage.from('park-photos').getPublicUrl(fileName);
    set('featured_image_url', data.publicUrl);
    setUploadingPhoto(false);
    showToast('Photo uploaded');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = { ...form };

    const { error } = isNew
      ? await supabase.from('parks').insert(payload)
      : await supabase.from('parks').update(payload).eq('id', park!.id!);

    setSaving(false);

    if (error) {
      showToast(error.message, false);
      return;
    }

    showToast('Saved!');
    if (isNew) router.push(`/admin/parks/${form.slug}`);
    else router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await supabase.from('parks').delete().eq('id', park!.id!);
    router.push('/admin/parks');
  }

  return (
    <form onSubmit={handleSave}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-semibold shadow-lg text-white transition ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-8">
        {/* Photo */}
        <div className="bg-white rounded-xl border border-[#eeeeee] p-5">
          <h2 className="text-sm font-bold text-[#362f35] mb-4">Featured Photo</h2>
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
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex items-center gap-2 text-sm font-semibold border border-[#dfdfdf] rounded-lg px-4 py-2 hover:bg-[#f7f5f2] transition disabled:opacity-50"
              >
                <Upload size={14} />
                {uploadingPhoto ? 'Uploading…' : form.featured_image_url ? 'Replace photo' : 'Upload photo'}
              </button>
              {form.featured_image_url && (
                <button
                  type="button"
                  onClick={() => set('featured_image_url', null)}
                  className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              )}
              <p className="text-xs text-[#a6967c]">JPG or PNG, max 10 MB</p>
            </div>
          </div>
        </div>

        {/* Core info */}
        <div className="bg-white rounded-xl border border-[#eeeeee] p-5 grid grid-cols-2 gap-4">
          <h2 className="col-span-2 text-sm font-bold text-[#362f35]">Core Info</h2>
          <Field label="Park Name *">
            <input required value={form.name ?? ''} onChange={e => set('name', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Slug *">
            <input required value={form.slug ?? ''} onChange={e => set('slug', e.target.value)} className={inputCls} placeholder="e.g. everglades-national-park" />
          </Field>
          <Field label="Park Type">
            <select value={form.park_type ?? ''} onChange={e => set('park_type', e.target.value)} className={inputCls}>
              <option value="">— Select —</option>
              {PARK_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Region">
            <select value={form.park_region ?? ''} onChange={e => set('park_region', e.target.value)} className={inputCls}>
              <option value="">— Select —</option>
              {PARK_REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="City">
            <input value={form.city ?? ''} onChange={e => set('city', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Entrance Fee">
            <input value={form.entrance_fee ?? ''} onChange={e => set('entrance_fee', e.target.value)} className={inputCls} placeholder="e.g. Free, $6/vehicle" />
          </Field>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="featured" checked={!!form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="accent-[#ff7044]" />
            <label htmlFor="featured" className="text-sm text-[#413734] font-medium">Featured park</label>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-white rounded-xl border border-[#eeeeee] p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#362f35]">Descriptions</h2>
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
        </div>

        {/* Contact & Hours */}
        <div className="bg-white rounded-xl border border-[#eeeeee] p-5 grid grid-cols-2 gap-4">
          <h2 className="col-span-2 text-sm font-bold text-[#362f35]">Contact & Hours</h2>
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
          <Field label="Google Rating">
            <input type="number" step="0.1" min="0" max="5" value={form.google_rating ?? ''} onChange={e => set('google_rating', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} />
          </Field>
          <div className="col-span-2">
            <Field label="Operating Hours">
              <textarea rows={4} value={form.operating_hours ?? ''} onChange={e => set('operating_hours', e.target.value)} className={textareaCls} placeholder="Monday: 8:00 AM – 5:00 PM&#10;Tuesday: 8:00 AM – 5:00 PM" />
            </Field>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-[#eeeeee] p-5 grid grid-cols-2 gap-4">
          <h2 className="col-span-2 text-sm font-bold text-[#362f35]">Location</h2>
          <Field label="Latitude">
            <input type="number" step="any" value={form.latitude ?? ''} onChange={e => set('latitude', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} />
          </Field>
          <Field label="Longitude">
            <input type="number" step="any" value={form.longitude ?? ''} onChange={e => set('longitude', e.target.value ? parseFloat(e.target.value) : null)} className={inputCls} />
          </Field>
        </div>

        {/* Extra */}
        <div className="bg-white rounded-xl border border-[#eeeeee] p-5 grid grid-cols-2 gap-4">
          <h2 className="col-span-2 text-sm font-bold text-[#362f35]">Additional Details</h2>
          <Field label="Managing Agency">
            <input value={form.managing_agency ?? ''} onChange={e => set('managing_agency', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Best Season">
            <input value={form.best_season ?? ''} onChange={e => set('best_season', e.target.value)} className={inputCls} placeholder="e.g. Fall–Spring" />
          </Field>
          <Field label="Typical Visit Duration">
            <input value={form.typical_visit_duration ?? ''} onChange={e => set('typical_visit_duration', e.target.value)} className={inputCls} placeholder="e.g. 2–4 hours" />
          </Field>
          <Field label="Instagram Hashtag">
            <input value={form.instagram_hashtag ?? ''} onChange={e => set('instagram_hashtag', e.target.value)} className={inputCls} placeholder="#evergladesnps" />
          </Field>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pb-8">
          <div>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition disabled:opacity-50"
              >
                <Trash2 size={14} />
                {deleting ? 'Deleting…' : 'Delete park'}
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#ff7044] hover:bg-[#e85a2e] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? 'Saving…' : isNew ? 'Create park' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
