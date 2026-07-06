import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCharacter } from '@/lib/data';
import { CharacterDetailView } from '@/components/CharacterDetailView';
import { SiteHeader } from '@/components/SiteHeader';

export default async function CharacterDetailPage({ params }: { params: { slug: string } }) {
  const character = await fetchCharacter(params.slug);
  if (!character) notFound();

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/explore"
          className="mb-8 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-label text-ink-dim transition hover:text-lime"
        >
          ← Marketplace
        </Link>
        <CharacterDetailView character={character} />
      </div>
    </>
  );
}
