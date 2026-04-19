import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import ParkEditForm from './ParkEditForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: slug === 'new' ? 'Add Park' : `Edit — ${slug}` };
}

export default async function ParkEditPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  let park = null;
  if (slug !== 'new') {
    const { data } = await supabase.from('parks').select('*').eq('slug', slug).single();
    if (!data) notFound();
    park = data;
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/parks" className="flex items-center gap-1.5 text-sm text-[#726d6b] hover:text-[#413734] transition">
          <ArrowLeft size={15} />
          Parks
        </Link>
        <span className="text-[#dfdfdf]">/</span>
        <span className="text-sm text-[#362f35] font-medium">{park ? park.name : 'Add Park'}</span>
      </div>

      {park && (
        <div className="flex items-center gap-3 mb-6">
          <a
            href={`/parks/${park.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#ff7044] hover:underline"
          >
            View on site →
          </a>
        </div>
      )}

      <ParkEditForm park={park} />
    </div>
  );
}
