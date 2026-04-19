'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

const inputCls = 'w-full border border-[#dfdfdf] rounded-lg px-3 py-2.5 text-sm text-[#413734] outline-none focus:border-[#ff7044] transition';
const font = { fontFamily: 'Archivo, sans-serif' };

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setInfo('Check your email for a reset link.');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#eeeeee] p-8">
        <div className="mb-8 text-center">
          <span style={{ fontFamily: 'Shrikhand, cursive', color: '#ff7044', fontSize: '1.6rem' }}>
            DFP Admin
          </span>
          <p className="text-sm text-[#726d6b] mt-1" style={font}>
            {mode === 'login' ? 'Sign in to manage parks' : 'Reset your password'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#413734] mb-1" style={font}>Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls} style={font} placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#413734] mb-1" style={font}>Password</label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputCls} style={font}
              />
            </div>

            {error && <p className="text-sm text-red-600" style={font}>{error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#ff7044] hover:bg-[#e85a2e] text-white font-semibold rounded-lg py-2.5 text-sm transition disabled:opacity-50"
              style={font}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}
              className="w-full text-xs text-[#a6967c] hover:text-[#413734] transition pt-1"
              style={font}
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#413734] mb-1" style={font}>Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls} style={font} placeholder="you@example.com"
              />
            </div>

            {error && <p className="text-sm text-red-600" style={font}>{error}</p>}
            {info  && <p className="text-sm text-green-600" style={font}>{info}</p>}

            {!info && (
              <button
                type="submit" disabled={loading}
                className="w-full bg-[#ff7044] hover:bg-[#e85a2e] text-white font-semibold rounded-lg py-2.5 text-sm transition disabled:opacity-50"
                style={font}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            )}

            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setInfo(''); }}
              className="w-full text-xs text-[#a6967c] hover:text-[#413734] transition pt-1"
              style={font}
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
