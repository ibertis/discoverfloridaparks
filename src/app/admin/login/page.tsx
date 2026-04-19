'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role;
    if (role !== 'admin' && role !== 'editor') {
      await supabase.auth.signOut();
      setError('Your account does not have admin access.');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#eeeeee] p-8">
        <div className="mb-8 text-center">
          <span style={{ fontFamily: 'Shrikhand, cursive', color: '#ff7044', fontSize: '1.6rem' }}>
            DFP Admin
          </span>
          <p className="text-sm text-[#726d6b] mt-1" style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 400 }}>
            Sign in to manage parks
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#413734] mb-1" style={{ fontFamily: 'Archivo, sans-serif' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm text-[#413734] outline-none focus:border-[#ff7044] transition"
              style={{ fontFamily: 'Archivo, sans-serif' }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#413734] mb-1" style={{ fontFamily: 'Archivo, sans-serif' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm text-[#413734] outline-none focus:border-[#ff7044] transition"
              style={{ fontFamily: 'Archivo, sans-serif' }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" style={{ fontFamily: 'Archivo, sans-serif' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff7044] hover:bg-[#e85a2e] text-white font-semibold rounded-lg py-2.5 text-sm transition disabled:opacity-50"
            style={{ fontFamily: 'Archivo, sans-serif' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
