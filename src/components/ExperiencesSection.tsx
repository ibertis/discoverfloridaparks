import ExperienceCard, { type CatalogExperience } from './ExperienceCard';

interface Props {
  parkName: string;
  experiences: CatalogExperience[];
}

export default function ExperiencesSection({ parkName, experiences }: Props) {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section style={{ background: '#f9f7f5', padding: '60px 0' }}>
      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '0 24px' }}>

        <p style={{
          fontFamily: 'Archivo, sans-serif',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: '#a6967c',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '0 0 8px',
        }}>
          Book an Experience
        </p>

        <h2 style={{
          fontFamily: 'Shrikhand, cursive',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 400,
          color: '#362f35',
          letterSpacing: '-0.04em',
          lineHeight: 0.98,
          margin: '0 0 40px',
        }}>
          Explore {parkName} with a Guide
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          marginBottom: 20,
        }}>
          {experiences.map(exp => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>

        <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', color: '#a6967c', margin: 0, lineHeight: 1.6 }}>
          Some links above are affiliate links. Discover Florida Parks may earn a commission if you book through them, at no extra cost to you.
        </p>

      </div>
    </section>
  );
}
