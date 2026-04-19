'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

const inputCls = 'w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm text-[#413734] outline-none focus:border-[#ff7044] transition';
const font = { fontFamily: 'Archivo, sans-serif' };

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/admin');
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#eeeeee] p-8 text-center">
          <span style={{ fontFamily: 'Shrikhand, cursive', color: '#ff7044', fontSize: '1.6rem' }}>DFP Admin</span>
          <p className="text-sm text-[#726d6b] mt-4" style={font}>Verifying reset link…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#eeeeee] p-8">
        <div className="mb-8 text-center">
          <span style={{ fontFamily: 'Shrikhand, cursive', color: '#ff7044', fontSize: '1.6rem' }}>DFP Admin</span>
          <p className="text-sm text-[#726d6b] mt-1" style={font}>Set a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#413734] mb-1" style={font}>New password</label>
            <input
              type="password" required minLength={8} value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputCls} style={font} placeholder="Minimum 8 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#413734] mb-1" style={font}>Confirm password</label>
            <input
              type="password" required minLength={8} value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className={inputCls} style={font}
            />
          </div>

          {error && <p className="text-sm text-red-600" style={font}>{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#ff7044] hover:bg-[#e85a2e] text-white font-semibold rounded-lg py-2.5 text-sm transition disabled:opacity-50"
            style={font}
          >
            {loading ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      </div>
    </div>
  );
}
