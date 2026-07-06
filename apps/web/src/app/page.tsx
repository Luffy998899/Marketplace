'use client';

import { AmbientBackground } from '@/components/AmbientBackground';
import { LandingFinalCta } from '@/components/landing/LandingFinalCta';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingManifesto } from '@/components/landing/LandingManifesto';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingPillars } from '@/components/landing/LandingPillars';
import { LandingShowcase } from '@/components/landing/LandingShowcase';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AmbientBackground />
      <LandingNav />
      <main>
        <LandingHero />
        <LandingPillars />
        <LandingManifesto />
        <LandingHowItWorks />
        <LandingShowcase />
        <LandingFinalCta />
      </main>
    </div>
  );
}
