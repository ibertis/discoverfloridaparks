'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminUserRow as AdminUser } from '@/lib/supabase-admin';
import { UserPlus, Trash2 } from 'lucide-react';

const inputCls = 'w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm text-[#413734] outline-none focus:border-[#ff7044] transition bg-white';

type Role = 'admin' | 'editor';
type Msg = { ok: boolean; msg: string } | null;

export default function UsersClient({ currentUserId, users }: { currentUserId: string; users: AdminUser[] }) {
  const router = useRouter();
  const load = () => router.refresh();
  const [listMsg, setListMsg] = useState<Msg>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<Msg>(null);

  async function changeRole(u: AdminUser, next: Role | null) {
    if (next === null && !confirm(`Remove admin access for ${u.email}? Their account stays, but they can no longer sign in to the admin.`)) return;
    setBusyId(u.id); setListMsg(null);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, role: next }),
    });
    const json = await res.json();
    setBusyId(null);
    if (!res.ok) { setListMsg({ ok: false, msg: json.error ?? 'Update failed' }); return; }
    setListMsg({ ok: true, msg: `Updated ${u.email}.` });
    load();
  }

  async function remove(u: AdminUser) {
    if (!confirm(`Delete the account for ${u.email}? This cannot be undone.`)) return;
    setBusyId(u.id); setListMsg(null);
    const res = await fetch('/api/admin/users', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id }),
    });
    const json = await res.json();
    setBusyId(null);
    if (!res.ok) { setListMsg({ ok: false, msg: json.error ?? 'Delete failed' }); return; }
    setListMsg({ ok: true, msg: `Deleted ${u.email}.` });
    load();
  }

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviting(true); setInviteMsg(null);
    const res = await fetch('/api/admin/invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    const json = await res.json();
    setInviting(false);
    if (!res.ok) { setInviteMsg({ ok: false, msg: json.error ?? 'Invite failed' }); return; }
    setInviteMsg({ ok: true, msg: `Invite sent to ${email}. The email links to a page where they set their password.` });
    setEmail('');
    load();
  }

  const team = users.filter(u => u.role);
  const others = users.filter(u => !u.role);

  const row = (u: AdminUser) => {
    const self = u.id === currentUserId;
    return (
      <div key={u.id} className="flex items-center gap-3 py-3 border-t border-[#f2eeeb] first:border-t-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#413734] truncate">{u.email}{self && <span className="ml-2 text-xs font-normal text-[#a6967c]">(you)</span>}</p>
          <p className="text-xs text-[#a6967c]">
            {u.status === 'active' && u.last_sign_in_at ? `Last signed in ${new Date(u.last_sign_in_at).toLocaleDateString()}` : u.status === 'invited' ? 'Invited, not signed in yet' : 'Never signed in'}
          </p>
        </div>
        <select
          value={u.role ?? ''}
          disabled={self || busyId === u.id}
          onChange={e => changeRole(u, (e.target.value || null) as Role | null)}
          className="border border-[#dfdfdf] rounded-lg px-2 py-1.5 text-sm text-[#413734] bg-white disabled:opacity-50"
          title={self ? 'You can’t change your own role' : undefined}
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="">No access</option>
        </select>
        <button
          type="button"
          onClick={() => remove(u)}
          disabled={self || busyId === u.id}
          className="p-2 text-[#a6967c] hover:text-red-600 disabled:opacity-30 disabled:hover:text-[#a6967c] transition"
          title={self ? 'You can’t delete your own account' : 'Delete account'}
          aria-label={`Delete ${u.email}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#eeeeee] p-5">
        <h2 className="text-sm font-bold text-[#362f35] mb-2">Team</h2>
        {team.length ? team.map(row) : <p className="text-sm text-[#a6967c] py-3">No team members yet.</p>}
        {others.length > 0 && (
          <>
            <h3 className="text-xs font-bold text-[#a6967c] uppercase tracking-wide mt-5 mb-1">Other accounts (no admin access)</h3>
            {others.map(row)}
          </>
        )}
        {listMsg && <p className={`text-sm mt-3 ${listMsg.ok ? 'text-green-600' : 'text-red-600'}`}>{listMsg.msg}</p>}
      </div>

      <div className="bg-white rounded-xl border border-[#eeeeee] p-5">
        <h2 className="text-sm font-bold text-[#362f35] mb-4">Invite a team member</h2>
        <form onSubmit={invite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#413734] mb-1">Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="editor@example.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#413734] mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)} className={inputCls}>
              <option value="editor">Editor: can edit parks, upload photos</option>
              <option value="admin">Admin: full access including user management</option>
            </select>
          </div>
          {inviteMsg && <p className={`text-sm ${inviteMsg.ok ? 'text-green-600' : 'text-red-600'}`}>{inviteMsg.msg}</p>}
          <button type="submit" disabled={inviting}
            className="flex items-center gap-2 bg-[#ff7044] hover:bg-[#e85a2e] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50">
            <UserPlus size={14} />
            {inviting ? 'Sending…' : 'Send invite'}
          </button>
        </form>
      </div>

      <div className="bg-[#fdf8f6] border border-[#eeeeee] rounded-xl p-5 text-sm text-[#726d6b] space-y-1.5">
        <p className="font-semibold text-[#413734] text-xs">Role permissions</p>
        <p><strong>Editor:</strong> edit any park, upload and replace photos. Cannot delete parks or manage users.</p>
        <p><strong>Admin:</strong> full access, including deleting parks and managing team members.</p>
        <p><strong>No access:</strong> keeps the account but blocks the admin. Use the trash icon to delete an account entirely.</p>
      </div>
    </div>
  );
}
