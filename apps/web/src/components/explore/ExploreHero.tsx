'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const HERO_VIDEO =
  'https://assets.mixkit.co/videos/preview/mixkit-woman-with-neon-face-paint-39852-large.mp4';

export function ExploreHero({ total }: { total?: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section ref={ref} className="relative min-h-[88svh] overflow-hidden">
      <motion.div style={{ scale }} className="absolute inset-0 origin-center">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%230f1113' width='100%25' height='100%25'/%3E%3C/svg%3E"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/75 to-canvas/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-canvas/95 via-canvas/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(209,254,23,0.12),transparent_60%)]" />

      <motion.div
        style={{ opacity, y }}
        className="relative mx-auto flex min-h-[88svh] max-w-[1600px] flex-col justify-end px-3 pb-14 pt-24 sm:px-6 sm:pb-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="badge-lime mb-4">Marketplace</span>
          <h1 className="heading-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.92]">
            License
            <br />
            <span className="text-lime">Synthetic</span>
            <br />
            Influencers
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-secondary sm:text-base">
            Cinematic previews. Escrow-protected checkout. Locked LoRAs, prompt packs, and character
            sheets unlock the moment you license.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#marketplace-grid" className="btn-lime">
              Browse grid
            </a>
            <Link href="/login" className="btn-ghost">
              Start licensing
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle pt-6 text-[11px] font-semibold uppercase tracking-label text-ink-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-lime" />
              {total ?? '120'}+ characters
            </span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>From $1</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>30% platform · escrow</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>SynthID verified</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
