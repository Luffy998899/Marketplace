'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';

const NAV = [
  { href: '/studio', label: 'Overview' },
  { href: '/studio/new', label: 'New listing' },
];

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="badge-lime mb-3">Creator Studio</span>
            <h1 className="heading-display text-3xl font-bold sm:text-4xl">List & earn</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-secondary">
              5-step listing wizard — identity, assets, SynthID, rights, moderation. Live listings
              appear on the marketplace when approved.
            </p>
          </div>
          <Link href="/studio/new" className="btn-lime shrink-0">
            + New character
          </Link>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`chip shrink-0 ${active ? 'chip-active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {children}
      </div>
    </>
  );
}
