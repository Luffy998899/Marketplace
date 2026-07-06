'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function LandingFinalCta() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 sm:py-28">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-card border border-lime/20 bg-gradient-to-br from-lime/10 via-surface to-canvas-deep p-8 sm:p-14"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime/10 blur-[80px]" />
        <div className="relative max-w-2xl">
          <h2 className="heading-display text-3xl font-bold sm:text-4xl">
            Ready to enter
            <br />
            <span className="text-lime">Synthetica?</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary sm:text-base">
            Whether you&apos;re licensing your first synthetic influencer or launching a creator studio,
            everything starts here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explore" className="btn-lime">
              Explore marketplace
            </Link>
            <Link href="/register" className="btn-ghost">
              Create account
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
