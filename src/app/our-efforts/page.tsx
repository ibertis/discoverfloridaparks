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
      partnerIntro="We're aligning with organizations that share our commitment to Florida's future. Want to nominate a group or stay in the loop?"
      pageSlug="our-efforts"
    />
  );
}
