import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import ExperienceEditForm from './ExperienceEditForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Edit Experience — ${id}` };
}

export default async function ExperienceEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase.from('experiences').select('*').eq('id', id).single();
  if (!data) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/experiences" className="flex items-center gap-1.5 text-sm text-[#726d6b] hover:text-[#413734] transition">
          <ArrowLeft size={15} />
          Experiences
        </Link>
        <span className="text-[#dfdfdf]">/</span>
        <span className="text-sm text-[#362f35] font-medium">{data.name}</span>
      </div>
      <ExperienceEditForm experience={data} />
    </div>
  );
}
