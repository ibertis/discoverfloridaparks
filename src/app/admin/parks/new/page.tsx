import ParkEditForm from '../[slug]/ParkEditForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Add Park' };

export default function NewParkPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/parks" className="flex items-center gap-1.5 text-sm text-[#726d6b] hover:text-[#413734] transition">
          <ArrowLeft size={15} />
          Parks
        </Link>
        <span className="text-[#dfdfdf]">/</span>
        <span className="text-sm text-[#362f35] font-medium">Add Park</span>
      </div>
      <ParkEditForm park={null} />
    </div>
  );
}
