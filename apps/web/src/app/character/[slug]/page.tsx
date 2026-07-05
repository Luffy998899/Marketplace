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
        <Link href="/" className="mb-6 inline-block text-sm text-neon-300 hover:text-neon-200">
          ← Back to marketplace
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl card-surface">
              <Image
                src={c.gallery[0]?.url ?? c.cover.url}
                alt={c.name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                placeholder={c.cover.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={c.cover.blurDataUrl}
                className="object-cover"
                priority
              />
              <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 text-[11px] uppercase tracking-wide text-white/70 backdrop-blur">
                watermarked preview
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {c.gallery.slice(1, 5).map((g) => (
                <div
                  key={g.id}
                  className="relative aspect-square overflow-hidden rounded-xl card-surface"
                >
                  <Image
                    src={g.url}
                    alt={c.name}
                    fill
                    sizes="20vw"
                    placeholder={g.blurDataUrl ? 'blur' : 'empty'}
                    blurDataURL={g.blurDataUrl}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="capitalize">{c.niche}</span>
              <span>•</span>
              <span className="capitalize">{c.style}</span>
              {c.synthIdVerified && (
                <span className="ml-auto flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs text-accent">
                  ✓ SynthID verified
                </span>
              )}
            </div>

            <h1 className="mt-1 text-3xl font-bold text-white">{c.name}</h1>
            <p className="mt-1 text-sm text-white/70">{c.tagline}</p>

            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="text-amber-300">★ {c.rating.toFixed(1)}</span>
              <span className="text-white/40">({c.ratingCount} reviews)</span>
              <span className="text-white/50">by {c.ownerName}</span>
              {c.verified && <span className="text-accent">✓</span>}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/70">{c.description}</p>

            <CheckoutPanel character={c} />

            <div className="mt-6 rounded-xl border border-dashed border-neon-500/30 bg-ink-900/40 p-4">
              <p className="text-sm font-semibold text-white">🔒 Locked character assets</p>
              <p className="mt-1 text-xs text-white/50">
                Unlocked after purchase via signed, expiring download links in your dashboard.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-white/70">
                {c.lockedAssets.map((a) => (
                  <li key={a.kind} className="flex items-center gap-2">
                    <span className="text-neon-400">▪</span> {a.label}
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
