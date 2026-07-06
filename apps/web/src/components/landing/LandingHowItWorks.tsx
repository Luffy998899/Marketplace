'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    step: '01',
    title: 'Discover',
    body: 'Preview watermarked characters in the marketplace grid — filter by niche, style, and price.',
  },
  {
    step: '02',
    title: 'License',
    body: 'Top up your wallet, purchase a tier, and receive a certificate plus signed download links.',
  },
  {
    step: '03',
    title: 'Create & scale',
    body: 'List your own synthetics, take commissions, or publish drops to the AI feed.',
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <span className="badge-lime mb-4">How it works</span>
        <h2 className="heading-display text-3xl font-bold sm:text-4xl">From preview to payout</h2>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((item, i) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="card-surface relative overflow-hidden p-6 sm:p-8"
          >
            <span className="font-display text-5xl font-bold text-lime/15">{item.step}</span>
            <h3 className="heading-display mt-2 text-lg font-bold">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
