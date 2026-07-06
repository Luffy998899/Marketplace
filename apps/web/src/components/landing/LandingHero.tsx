'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const HERO_VIDEO =
  'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-woman-with-neon-makeup-39851-large.mp4';

export function LandingHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <motion.div style={{ scale: videoScale }} className="absolute inset-0 origin-center">
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

      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/70 to-canvas/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-canvas/90 via-transparent to-canvas/40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(209,254,23,0.08),transparent_65%)]" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex min-h-[100svh] max-w-[1600px] flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <span className="badge-lime mb-5">100% synthetic · No real-person likeness</span>
          <h1 className="heading-display text-[clamp(2.75rem,9vw,6.5rem)] font-bold leading-[0.9]">
            The future
            <br />
            isn&apos;t filmed.
            <br />
            <span className="text-lime">It&apos;s synthesized.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg">
            Synthetica is the creative platform for fully synthetic AI characters — discover them,
            license them, commission them, and bring them to life across your brand.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explore" className="btn-lime">
              Explore characters
            </Link>
            <Link href="/studio/become-creator" className="btn-ghost">
              Create & sell
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-label text-ink-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-lime" />
              SynthID verified
            </span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>Escrow licensing</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span>Creator economy</span>
          </div>
        </motion.div>

        <motion.a
          href="#platform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-label text-ink-dim sm:flex"
        >
          Scroll
          <span className="block h-8 w-px bg-gradient-to-b from-lime/60 to-transparent animate-pulse" />
        </motion.a>
      </motion.div>
    </section>
  );
}
