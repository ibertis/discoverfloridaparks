'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { UserPlus } from 'lucide-react';

const inputCls = 'w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm text-[#413734] outline-none focus:border-[#ff7044] transition bg-white';

export default function UsersClient() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'admin'>('editor');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Sign up the user — they'll receive a confirmation email
    const { error } = await supabase.auth.signUp({
      email,
      password: crypto.randomUUID(), // temporary — user sets their own via email link
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    setLoading(false);

    if (error) {
      setResult({ ok: false, msg: error.message });
      return;
    }

    setResult({ ok: true, msg: `Invite sent to ${email}. They'll receive an email to set their password.` });
    setEmail('');
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#eeeeee] p-5">
        <h2 className="text-sm font-bold text-[#362f35] mb-4">Invite a team member</h2>
        <form onSubmit={invite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#413734] mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputCls}
              placeholder="editor@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#413734] mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'editor' | 'admin')}
              className={inputCls}
            >
              <option value="editor">Editor — can edit parks, upload photos</option>
              <option value="admin">Admin — full access including user management</option>
            </select>
          </div>

          {result && (
            <p className={`text-sm ${result.ok ? 'text-green-600' : 'text-red-600'}`}>{result.msg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#ff7044] hover:bg-[#e85a2e] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            <UserPlus size={14} />
            {loading ? 'Sending…' : 'Send invite'}
          </button>
        </form>
      </div>

      <div className="bg-[#fdf8f6] border border-[#eeeeee] rounded-xl p-5 text-sm text-[#726d6b] space-y-1.5">
        <p className="font-semibold text-[#413734] text-xs">Role permissions</p>
        <p><strong>Editor:</strong> edit any park, upload/replace photos — cannot delete parks or manage users</p>
        <p><strong>Admin:</strong> full access — edit, delete, and manage team members</p>
        <p className="text-xs text-[#a6967c] pt-1">To revoke access, go to your Supabase dashboard → Authentication → Users and delete the account.</p>
      </div>
    </div>
  );
}
