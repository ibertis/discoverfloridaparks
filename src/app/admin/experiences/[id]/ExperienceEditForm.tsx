'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, Trash2, Save } from 'lucide-react';

interface Experience {
  id?: string;
  name: string;
  description?: string | null;
  duration?: string | null;
  image_url?: string | null;
  href?: string | null;
  cta_label?: string | null;
  placement_type?: string | null;
  business_name?: string | null;
  contact_email?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  expires_at?: string | null;
}

interface Props {
  experience: Experience | null;
}

export default function ExperienceEditForm({ experience }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Experience>({
    name: '',
    description: null,
    duration: null,
    image_url: null,
    href: null,
    cta_label: 'Get Details',
    placement_type: 'editorial',
    business_name: null,
    contact_email: null,
    is_active: true,
    sort_order: 0,
    expires_at: null,
    ...experience,
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function set(field: keyof Experience, value: unknown) {
    setForm(f => ({ ...f, [field]: value === '' ? null : value }));
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const fileName = `exp-${Date.now()}.${ext}`;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('fileName', fileName);
      const res = await fetch('/admin/api/upload-experience-photo', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) { showToast(json.error ?? 'Upload failed', false); return; }
      set('image_url', json.url);
      showToast('Photo uploaded');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSave() {
    if (!form.name?.trim()) { showToast('Name is required', false); return; }
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

  const isSponsored = form.placement_type === 'sponsored';

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-lg transition ${toast.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Name *</label>
        <input
          value={form.name ?? ''}
          onChange={e => set('name', e.target.value)}
          placeholder="Crystal River Manatee Snorkeling Adventure"
          className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff7044] transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Description</label>
        <textarea
          value={form.description ?? ''}
          onChange={e => set('description', e.target.value)}
          rows={3}
          placeholder="A short, compelling description of the experience…"
          className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff7044] transition resize-none"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Duration</label>
        <input
          value={form.duration ?? ''}
          onChange={e => set('duration', e.target.value)}
          placeholder="e.g. 2 hours, Full day, 4 days / 3 nights"
          className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff7044] transition"
        />
      </div>

      {/* Photo */}
      <div>
        <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Photo</label>
        {form.image_url && (
          <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border border-[#dfdfdf]">
            <Image src={form.image_url} alt="Experience photo" fill style={{ objectFit: 'cover' }} />
          </div>
        )}
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#413734] hover:bg-[#362f35] text-white text-xs font-semibold px-3 py-2 rounded-lg transition disabled:opacity-50"
          >
            <Upload size={13} />
            {uploading ? 'Uploading…' : form.image_url ? 'Replace Photo' : 'Upload Photo'}
          </button>
          {form.image_url && (
            <button
              type="button"
              onClick={() => set('image_url', null)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition"
            >
              <Trash2 size={13} /> Remove
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">CTA Link (href)</label>
          <input
            value={form.href ?? ''}
            onChange={e => set('href', e.target.value)}
            placeholder="/parks?type=National+Wildlife+Refuge"
            className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff7044] transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">CTA Label</label>
          <input
            value={form.cta_label ?? ''}
            onChange={e => set('cta_label', e.target.value)}
            placeholder="Get Details"
            className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff7044] transition"
          />
        </div>
      </div>

      {/* Placement type */}
      <div>
        <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Placement Type</label>
        <select
          value={form.placement_type ?? 'editorial'}
          onChange={e => set('placement_type', e.target.value)}
          className="border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff7044] transition bg-white"
        >
          <option value="editorial">Editorial</option>
          <option value="sponsored">Sponsored</option>
        </select>
      </div>

      {/* Sponsored fields */}
      {isSponsored && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div>
            <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Business Name</label>
            <input
              value={form.business_name ?? ''}
              onChange={e => set('business_name', e.target.value)}
              placeholder="Florida Adventure Co."
              className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff7044] transition bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Contact Email</label>
            <input
              type="email"
              value={form.contact_email ?? ''}
              onChange={e => set('contact_email', e.target.value)}
              placeholder="contact@business.com"
              className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff7044] transition bg-white"
            />
          </div>
        </div>
      )}

      {/* Settings row */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Sort Order</label>
          <input
            type="number"
            value={form.sort_order ?? 0}
            onChange={e => set('sort_order', parseInt(e.target.value) || 0)}
            className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff7044] transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#726d6b] uppercase tracking-wide mb-1.5">Expires At</label>
          <input
            type="date"
            value={form.expires_at ? form.expires_at.slice(0, 10) : ''}
            onChange={e => set('expires_at', e.target.value || null)}
            className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#ff7044] transition"
          />
        </div>
        <div className="flex flex-col justify-end pb-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 accent-[#ff7044]"
            />
            <span className="text-sm font-medium text-[#362f35]">Active</span>
          </label>
          <p className="text-xs text-[#a6967c] mt-1">Visible on homepage when active</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[#eeeeee]">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#ff7044] hover:bg-[#e85a2e] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Experience'}
        </button>

        {experience?.id && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition disabled:opacity-50"
          >
            <Trash2 size={14} />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}
