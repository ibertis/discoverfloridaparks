import Link from 'next/link';

const COLUMNS = [
  {
    heading: 'FL Parks',
    links: ['National Parks', 'State Parks', 'Theme Parks', 'Water Parks'],
  },
  {
    heading: 'Travel',
    links: ['Destinations', 'Travel Trends', 'Our Deals', 'Upcoming Trips'],
  },
  {
    heading: 'Resources',
    links: ['News', 'Our Channel', 'The Ultimate App', 'Our Blog'],
  },
  {
    heading: 'Tips',
    links: ['Trip Planner', 'Travel Tips', 'Family Trips', 'Our Picks'],
  },
  {
    heading: 'Styles',
    links: ['Hot Deals', 'Clearance', 'New Deals', 'Our Shop'],
  },
  {
    heading: 'We Care',
    links: ['Conservation', 'Preservation', 'Useful Links', 'Our Efforts'],
  },
];

export default function FooterLinks() {
  return (
    <section style={{ background: '#fff', borderTop: '1px solid #eeeeee' }} className="page-section-pad">
      <div style={{ maxWidth: 1278, margin: '0 auto' }} className="footer-links-grid">

        {/* Left — contact form */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: 420, width: '100%' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>
            Drop us a line
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.8rem', color: '#362f35', margin: '0 0 20px', letterSpacing: '-0.04em', lineHeight: 1 }}>
            Have Questions?
          </h2>
          <hr style={{ border: 'none', borderTop: '3px solid #ff7044', width: 36, margin: '0 0 28px' }} />

          <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="text"
              placeholder="Your name"
              style={{
                background: '#f5f3f0', border: 'none', borderRadius: '2.3em',
                padding: '14px 22px', fontFamily: 'Glegoo, serif', fontSize: '0.9rem',
                color: '#362f35', outline: 'none', width: '100%',
              }}
            />
            <input
              type="email"
              placeholder="Your E-mail"
              style={{
                background: '#f5f3f0', border: 'none', borderRadius: '2.3em',
                padding: '14px 22px', fontFamily: 'Glegoo, serif', fontSize: '0.9rem',
                color: '#362f35', outline: 'none', width: '100%',
              }}
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              style={{
                background: '#f5f3f0', border: 'none', borderRadius: '1.4em',
                padding: '14px 22px', fontFamily: 'Glegoo, serif', fontSize: '0.9rem',
                color: '#362f35', outline: 'none', width: '100%', resize: 'vertical',
              }}
            />
            <label style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.68rem', color: '#726d6b', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" style={{ marginTop: 2, accentColor: '#ff7044', flexShrink: 0 }} />
              By using this form you agree with the storage and handling of your data by this website.
            </label>
            <div>
              <button
                type="submit"
                style={{
                  background: '#ff7044', color: '#fff', border: 'none', borderRadius: '2.3em',
                  padding: '13px 36px', fontFamily: 'Archivo, sans-serif', fontWeight: 700,
                  fontSize: '0.9rem', cursor: 'pointer',
                }}
                className="hover:opacity-85 transition-opacity"
              >
                Send a message
              </button>
            </div>
          </form>
          </div>
        </div>

        {/* Right — nav columns */}
        <div className="footer-nav-grid">
          {COLUMNS.map(col => (
            <div key={col.heading}>
              <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.45rem', color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {col.heading}
              </h3>
              <hr style={{ border: 'none', borderTop: '3px solid #a6967c', width: 28, margin: '0 0 16px' }} />
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <li key={link}>
                    <Link
                      href="#"
                      style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', color: '#726d6b', textDecoration: 'none' }}
                      className="hover:text-[#ff7044] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
