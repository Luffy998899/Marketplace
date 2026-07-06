'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const PILLARS = [
  {
    href: '/explore',
    eyebrow: 'Marketplace',
    title: 'License synthetic influencers',
    body: 'Browse a cinematic grid of AI avatars. Preview freely, unlock LoRAs and prompt packs after purchase.',
    cta: 'Open marketplace',
  },
  {
    href: '/studio',
    eyebrow: 'Creator Studio',
    title: 'List your own characters',
    body: 'Five-step compliance wizard — SynthID stamping, IP declaration, moderation — then earn on every license.',
    cta: 'Open studio',
  },
  {
    href: '/gigs',
    eyebrow: 'Commissions',
    title: 'Brief, bid, deliver',
    body: 'Post creative briefs or bid as a freelancer. Escrow holds funds until the buyer approves delivery.',
    cta: 'View gigs',
  },
  {
    href: '/feed',
    eyebrow: 'AI Feed',
    title: 'Synthetic social drops',
    body: 'Reels and stills from the ecosystem — the pulse of what creators are publishing right now.',
    cta: 'Watch feed',
  },
] as const;

export function LandingPillars() {
  return (
    <section id="platform" className="relative mx-auto max-w-[1600px] px-4 py-20 sm:px-6 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="mb-12 max-w-2xl"
      >
        <span className="badge-lime mb-4">The platform</span>
        <h2 className="heading-display text-3xl font-bold sm:text-4xl">
          One ecosystem.
          <br />
          <span className="text-lime">Four ways in.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary sm:text-base">
          Synthetica isn&apos;t just a storefront — it&apos;s infrastructure for synthetic creativity:
          licensing, creation, commissions, and culture.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
        {PILLARS.map((pillar, i) => (
          <motion.div
            key={pillar.href}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          >
            <Link
              href={pillar.href}
              className="card-surface card-interactive group flex h-full flex-col p-6 sm:p-8"
            >
              <span className="text-[10px] font-bold uppercase tracking-label text-lime">
                {pillar.eyebrow}
              </span>
              <h3 className="heading-display mt-3 text-xl font-bold sm:text-2xl">{pillar.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-secondary">{pillar.body}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-label text-ink group-hover:text-lime">
                {pillar.cta}
                <span aria-hidden className="transition group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
