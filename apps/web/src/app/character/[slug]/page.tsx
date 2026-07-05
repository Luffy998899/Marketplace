import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { fetchCharacter } from '@/lib/data';
import { CheckoutPanel } from '@/components/CheckoutPanel';
import { SiteHeader } from '@/components/SiteHeader';

export default async function CharacterDetailPage({ params }: { params: { slug: string } }) {
  const character = await fetchCharacter(params.slug);
  if (!character) notFound();
  const c = character;

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-label text-ink-dim hover:text-lime"
        >
          ← Marketplace
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="card-surface relative aspect-[4/5] overflow-hidden">
              <Image
                src={c.gallery[0]?.url ?? c.cover.url}
                alt={c.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                placeholder={c.cover.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={c.cover.blurDataUrl}
                className="object-cover"
                priority
              />
              <span className="pointer-events-none absolute right-3 top-3 badge-lime !bg-black/60 !text-ink-secondary backdrop-blur-sm">
                Watermarked
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {c.gallery.slice(1, 5).map((g) => (
                <div key={g.id} className="card-surface relative aspect-square overflow-hidden">
                  <Image
                    src={g.url}
                    alt={c.name}
                    fill
                    sizes="15vw"
                    placeholder={g.blurDataUrl ? 'blur' : 'empty'}
                    blurDataURL={g.blurDataUrl}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-label text-ink-dim">
              <span className="capitalize">{c.niche}</span>
              <span>·</span>
              <span className="capitalize">{c.style}</span>
              {c.synthIdVerified && (
                <span className="ml-auto badge-lime">SynthID ✓</span>
              )}
            </div>

            <h1 className="heading-display mt-2 text-4xl font-bold sm:text-5xl">{c.name}</h1>
            <p className="mt-2 text-ink-secondary">{c.tagline}</p>

            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="font-semibold text-lime">★ {c.rating.toFixed(1)}</span>
              <span className="text-ink-dim">({c.ratingCount})</span>
              <span className="text-ink-secondary">by {c.ownerName}</span>
              {c.verified && <span className="text-lime">✓</span>}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-ink-secondary">{c.description}</p>

            <CheckoutPanel character={c} />

            <div className="card-surface mt-6 border-dashed p-5">
              <p className="font-display text-xs font-bold uppercase tracking-label text-ink">
                🔒 Locked assets
              </p>
              <p className="mt-1 text-xs text-ink-dim">
                Unlocked via signed expiring links after purchase.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-secondary">
                {c.lockedAssets.map((a) => (
                  <li key={a.kind} className="flex items-center gap-2">
                    <span className="text-lime">▪</span> {a.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
