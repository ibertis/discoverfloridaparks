import Link from 'next/link';

export default function PreviewBanner() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#ff7044', color: '#fff', textAlign: 'center',
      padding: '10px 16px', fontFamily: 'Archivo, sans-serif',
      fontSize: '14px', fontWeight: 600,
    }}>
      Preview Mode Active{' '}
      <Link href="/api/disable-draft" style={{ color: '#fff', textDecoration: 'underline', marginLeft: 12 }}>
        Exit Preview
      </Link>
    </div>
  );
}
