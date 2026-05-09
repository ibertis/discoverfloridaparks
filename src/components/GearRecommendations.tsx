import { GEAR_CATEGORIES } from '@/lib/gear';

interface Props {
  amenities: Record<string, unknown>;
}

export default function GearRecommendations({ amenities }: Props) {
  const activeCategories = GEAR_CATEGORIES.filter(
    cat => amenities?.[cat.amenityKey] === true
  );

  if (activeCategories.length === 0) return null;

  return (
    <section>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
        Gear Up
      </p>
      <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.14rem', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 24px', paddingBottom: 16, borderBottom: '1px solid #eeeeee' }}>
        What to Pack
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {activeCategories.map(category => (
          <div key={category.amenityKey}>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: '#413734', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
              {category.label}
            </p>
            <div className="gear-grid">
              {category.items.map(item => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  style={{ display: 'block', textDecoration: 'none', borderRadius: 16, border: '1px solid #eeeeee', background: '#fff', padding: '16px 20px' }}
                >
                  <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#362f35', margin: '0 0 4px' }}>
                    {item.name}
                  </p>
                  <p style={{ fontFamily: 'Glegoo, serif', fontSize: '0.8rem', fontWeight: 700, color: '#726d6b', margin: '0 0 10px' }}>
                    {item.description}
                  </p>
                  <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#ff7044' }}>
                    View on Amazon →
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#a6967c', marginTop: 20, lineHeight: 1.6 }}>
        Gear links are affiliate links. We earn a small commission at no extra cost to you.
      </p>
    </section>
  );
}
