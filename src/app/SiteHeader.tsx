import Link from 'next/link';
import Image from 'next/image';

export default function SiteHeader() {
  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #eeeeee', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="site-header-inner" style={{ maxWidth: 1278, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link href="/" style={{ flexShrink: 0 }}>
          <Image src="/dfp-logo.png" alt="Discover Florida Parks" width={200} height={52} style={{ objectFit: 'contain', display: 'block' }} priority />
        </Link>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: 28 }}>
          {['National Parks', 'State Parks', 'County Parks', 'Theme Parks', 'Water Parks'].map(t => (
            <Link key={t} href={`/parks?type=${encodeURIComponent(t)}`}
              style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#413734', whiteSpace: 'nowrap' }}
              className="hover:text-[#ff7044] transition-colors">
              {t}
            </Link>
          ))}
        </nav>

        {/* View Map — always visible */}
        <Link href="/map"
          style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '10px 22px', fontFamily: 'Archivo, sans-serif', fontSize: '0.88rem', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}
          className="hover:opacity-90 transition-opacity">
          View Map
        </Link>

      </div>
    </header>
  );
}
