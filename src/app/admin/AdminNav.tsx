'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Trees, Users, LayoutDashboard, LogOut } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/parks', label: 'Parks', icon: Trees },
];

export default function AdminNav({ role, userEmail }: { role: string; userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-[#eeeeee] min-h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-[#eeeeee]">
        <span style={{ fontFamily: 'Shrikhand, cursive', color: '#ff7044', fontSize: '1.25rem' }}>
          DFP Admin
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-[#ff7044]/10 text-[#ff7044]'
                  : 'text-[#413734] hover:bg-[#f7f5f2]'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        {role === 'admin' && (
          <Link
            href="/admin/users"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
              pathname.startsWith('/admin/users')
                ? 'bg-[#ff7044]/10 text-[#ff7044]'
                : 'text-[#413734] hover:bg-[#f7f5f2]'
            }`}
          >
            <Users size={16} />
            Users
          </Link>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-[#eeeeee]">
        <p className="text-xs text-[#a6967c] truncate mb-2">{userEmail}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-xs text-[#726d6b] hover:text-[#413734] transition"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
