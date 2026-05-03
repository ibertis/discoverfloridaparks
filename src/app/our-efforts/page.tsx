import WeCarePage from '@/components/WeCarePage';

export const metadata = {
  title: 'Our Efforts | Discover Florida Parks',
  description: 'Discover Florida Parks is committed to connecting people with Florida\'s natural spaces and ensuring those spaces remain open, healthy, and accessible for generations to come.',
};

export default function OurEffortsPage() {
  return (
    <WeCarePage
      eyebrow="We Care · Our Efforts"
      headline="Our Commitment to Florida"
      subhead="Discover Florida Parks exists to connect people with Florida's natural spaces — and to ensure those spaces remain open, healthy, and accessible for generations to come."
      heroBg="/plan-your-trip.jpg"
      pillars={[
        {
          title: 'Responsible Tourism',
          body: 'We encourage visitors to explore with respect — staying on trails, leaving no trace, and supporting local conservation organizations.',
        },
        {
          title: 'Amplifying Voices',
          body: 'We partner with and spotlight the organizations doing the hard work of protecting Florida\'s parks and wild spaces.',
        },
        {
          title: 'Community Education',
          body: 'Through our guides and resources, we help visitors understand the ecological and cultural significance of the places they explore.',
        },
      ]}
      partnerIntro="These organizations share our belief that protecting Florida starts with policy, advocacy, and empowering the people who call it home."
      partners={[
        {
          name: 'Biscayne Bay Waterkeeper',
          tagline: "Protecting South Florida's watershed through science and citizen action.",
          href: 'https://www.miamiwaterkeeper.org',
          logo: '/logos/partners/biscayne-bay-waterkeeper.png',
        },
        {
          name: '1000 Friends of Florida',
          tagline: 'Fighting sprawl and advocating for smart growth statewide.',
          href: 'https://1000fof.org',
          logo: '/logos/partners/1000-friends-of-florida.png',
        },
        {
          name: 'Florida Conservation Group',
          tagline: "Science-based conservation for Florida's vast southern ranchlands.",
          href: 'https://floridaconserve.org',
          logo: '/logos/partners/florida-conservation-group.png',
        },
        {
          name: 'Waterkeepers Florida',
          tagline: "A coalition of Waterkeeper organizations protecting Florida's waterways.",
          href: 'https://www.waterkeepersflorida.org/',
          logo: '/logos/partners/waterkeepers-florida.png',
        },
      ]}
      pageSlug="our-efforts"
    />
  );
}
