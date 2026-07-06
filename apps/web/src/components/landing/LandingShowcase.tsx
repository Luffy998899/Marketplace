'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { NicheMarquee } from '@/components/NicheMarquee';

export function LandingShowcase() {
  return (
    <section className="relative overflow-hidden border-y border-border-subtle py-16 sm:py-20">
      <div className="mx-auto mb-10 max-w-[1600px] px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <span className="badge-lime mb-3">120+ niches</span>
            <h2 className="heading-display text-2xl font-bold sm:text-3xl">
              Built for every vertical
            </h2>
          </div>
          <Link href="/explore" className="btn-ghost !text-xs">
            Browse all →
          </Link>
        </motion.div>
      </div>
      <NicheMarquee />
    </section>
  );
}
