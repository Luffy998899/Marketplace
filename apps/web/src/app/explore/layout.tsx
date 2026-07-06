import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore — Synthetica',
  description: 'Browse and license fully synthetic AI characters on the Synthetica marketplace.',
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
