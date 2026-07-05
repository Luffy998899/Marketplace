'use client';

import { formatMoney, type CharacterDetailDTO } from '@acm/shared';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckoutPanel } from './CheckoutPanel';

/** Sticky purchase column with scroll-triggered gallery on character detail. */
export function CharacterDetailView({ character }: { character: CharacterDetailDTO }) {
  const c = character;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="card-surface relative aspect-[4/5] overflow-hidden lg:sticky lg:top-24">
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
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent" />
          <span className="absolute right-3 top-3 badge-lime !bg-black/50 backdrop-blur-sm">
            Watermarked
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
          {c.gallery.slice(1, 5).map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="card-surface relative aspect-square overflow-hidden"
            >
              <Image
                src={g.url}
                alt={c.name}
                fill
                sizes="15vw"
                placeholder={g.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={g.blurDataUrl}
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="lg:sticky lg:top-24 lg:self-start"
      >
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-label text-ink-dim">
          <span className="capitalize">{c.niche}</span>
          <span>·</span>
          <span className="capitalize">{c.style}</span>
          {c.synthIdVerified && <span className="ml-auto badge-lime">SynthID ✓</span>}
        </div>

        <h1 className="heading-display mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{c.name}</h1>
        <p className="mt-2 text-lg text-ink-secondary">{c.tagline}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="font-display text-2xl font-bold text-lime">★ {c.rating.toFixed(1)}</span>
          <span className="text-sm text-ink-dim">({c.ratingCount} reviews)</span>
          <span className="text-sm text-ink-secondary">
            {c.ownerName}
            {c.verified && <span className="ml-1 text-lime">✓</span>}
          </span>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-ink-secondary">{c.description}</p>

        <div className="mt-2 rounded-card border border-lime/20 bg-lime/[0.04] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-label text-lime">From</p>
          <p className="font-display text-3xl font-bold text-lime">
            {formatMoney(c.fromPriceMinor, c.currency)}
          </p>
        </div>

        <CheckoutPanel character={c} />

        <div className="card-surface mt-6 border-dashed p-5">
          <p className="font-display text-xs font-bold uppercase tracking-label text-ink">
            🔒 Locked assets
          </p>
          <p className="mt-1 text-xs text-ink-dim">Signed expiring links after purchase.</p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-secondary">
            {c.lockedAssets.map((a) => (
              <li key={a.kind} className="flex items-center gap-2">
                <span className="text-lime">▪</span> {a.label}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
