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
      heroBg="/hero-3.jpg"
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
      partnerIntro="We're curating a list of preservation organizations working to safeguard Florida's irreplaceable places. Know one that should be here?"
      pageSlug="preservation"
    />
  );
}
