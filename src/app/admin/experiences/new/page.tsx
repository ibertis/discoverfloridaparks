import ExperienceEditForm from '../[id]/ExperienceEditForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Add Experience' };

export default function NewExperiencePage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/experiences" className="flex items-center gap-1.5 text-sm text-[#726d6b] hover:text-[#413734] transition">
          <ArrowLeft size={15} />
          Experiences
        </Link>
        <span className="text-[#dfdfdf]">/</span>
        <span className="text-sm text-[#362f35] font-medium">Add Experience</span>
      </div>
      <ExperienceEditForm experience={null} />
    </div>
  );
}
