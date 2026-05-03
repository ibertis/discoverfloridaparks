import WeCarePage from '@/components/WeCarePage';

export const metadata = {
  title: 'Conservation | Discover Florida Parks',
  description: "Florida's ecosystems are among the most biodiverse in North America. Learn how Discover Florida Parks supports conservation efforts across the state.",
};

export default function ConservationPage() {
  return (
    <WeCarePage
      eyebrow="We Care · Conservation"
      headline="Protect What We Love"
      subhead="Florida's ecosystems — its wetlands, coral reefs, and wildlife corridors — are among the most biodiverse in North America. We believe exploring these spaces comes with a responsibility to protect them."
      heroBg="/hero-1.jpg"
      pillars={[
        {
          title: 'Wildlife Habitat',
          body: 'Preserving the corridors and ecosystems that Florida\'s native species depend on to survive and thrive.',
        },
        {
          title: 'Water Conservation',
          body: 'From the Everglades to the Springs, clean water is the lifeblood of Florida\'s natural spaces.',
        },
        {
          title: 'Ecosystem Health',
          body: 'Healthy ecosystems sustain the parks we love. We advocate for science-led conservation efforts across the state.',
        },
      ]}
      partnerIntro="These organizations are on the front lines of protecting Florida's living ecosystems — from the Everglades to the coral reef to the springs."
      partners={[
        {
          name: 'The Everglades Foundation',
          tagline: 'Restoring the Everglades through science, advocacy, and policy.',
          href: 'https://www.evergladesfoundation.org',
          logo: '/logos/partners/everglades-foundation.png',
        },
        {
          name: 'Audubon Florida',
          tagline: 'Protecting birds, wetlands, and the ecosystems that sustain them.',
          href: 'https://fl.audubon.org',
          logo: '/logos/partners/audubon-florida.png',
        },
        {
          name: 'Florida Wildlife Corridor Foundation',
          tagline: 'Connecting 18 million acres from the Everglades to Georgia.',
          href: 'https://floridawildlifecorridor.org',
          logo: '/logos/partners/florida-wildlife-corridor.png',
        },
        {
          name: 'Coral Restoration Foundation',
          tagline: "Restoring Florida's critically endangered reef system.",
          href: 'https://www.coralrestoration.org',
          logo: '/logos/partners/coral-restoration-foundation.png',
        },
        {
          name: 'Mote Marine Laboratory',
          tagline: 'Marine research and coral restoration since 1955.',
          href: 'https://mote.org',
          logo: '/logos/partners/mote-marine.png',
        },
        {
          name: 'Florida Springs Council',
          tagline: "Advocating for Florida's threatened spring systems.",
          href: 'https://www.floridaspringscouncil.org',
          logo: '/logos/partners/florida-springs-council.png',
        },
      ]}
      pageSlug="conservation"
    />
  );
}
