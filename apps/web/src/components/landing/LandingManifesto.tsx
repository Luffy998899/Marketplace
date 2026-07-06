'use client';

import { motion } from 'framer-motion';

const LINES = [
  'No cameras. No casting calls. No likeness risk.',
  'Every face, voice, and frame is generated — owned, licensed, and traceable.',
  'We built the rails: escrow, SynthID, certificates, and creator payouts.',
] as const;

export function LandingManifesto() {
  return (
    <section className="relative border-y border-border-subtle bg-canvas-deep/50">
      <div className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="badge-lime mb-4">Manifesto</span>
            <h2 className="heading-display text-3xl font-bold leading-tight sm:text-4xl">
              Synthetic media
              <br />
              deserves synthetic
              <br />
              <span className="text-lime">infrastructure.</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {LINES.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="border-l-2 border-lime/40 pl-5 text-base leading-relaxed text-ink-secondary sm:text-lg"
              >
                {line}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
