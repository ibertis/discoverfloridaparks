import WeCarePage from '@/components/WeCarePage';

export const metadata = {
  title: 'Preservation | Discover Florida Parks',
  description: "Florida's natural and cultural landmarks carry centuries of history. Learn how Discover Florida Parks supports preservation efforts across the state.",
};

export default function PreservationPage() {
  return (
    <WeCarePage
      eyebrow="We Care · Preservation"
      headline="Honor What Came Before"
      subhead="Florida's natural and cultural landmarks carry centuries of history. Preserving these places means future generations will have the same opportunity to discover and be moved by them."
      heroBg={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/park-photos/page-heroes/preservation.jpg`}
      pillars={[
        {
          title: 'Natural Landmarks',
          body: 'Ancient cypress forests, fossil-bearing rivers, and rare geological formations that tell Florida\'s deep natural history.',
        },
        {
          title: 'Cultural Heritage',
          body: 'Indigenous histories, settler stories, and the living traditions that have shaped Florida\'s identity.',
        },
        {
          title: 'Historic Sites',
          body: 'Lighthouses, forts, and structures that anchor Florida\'s past to its present — and are worth protecting.',
        },
      ]}
      partnerIntro="These organizations are permanently protecting Florida's most irreplaceable lands, rivers, and wild places for generations to come."
      partners={[
        {
          name: 'The Nature Conservancy — Florida',
          tagline: 'Over 1.3 million acres of vital Florida land conserved.',
          href: 'https://www.nature.org/en-us/about-us/where-we-work/united-states/florida/',
          logo: '/logos/partners/nature-conservancy-florida.png',
        },
        {
          name: 'Conservation Florida',
          tagline: 'A homegrown land trust protecting the Florida Wildlife Corridor.',
          href: 'https://www.conservationflorida.org',
          logo: '/logos/partners/conservation-florida.png',
        },
        {
          name: 'Florida Wildlife Federation',
          tagline: "Watchdog for Florida's lands, wildlife, and conservation law.",
          href: 'https://fwfonline.org',
          logo: '/logos/partners/florida-wildlife-federation.png',
        },
        {
          name: 'Apalachicola Riverkeeper',
          tagline: "Fighting for one of Florida's most ecologically significant rivers.",
          href: 'https://www.apalachicolariverkeeper.org',
          logo: '/logos/partners/apalachicola-riverkeeper.png',
        },
      ]}
      pageSlug="preservation"
    />
  );
}
