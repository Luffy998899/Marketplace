'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

const LINKS = [
  { href: '/explore', label: 'Explore' },
  { href: '/studio', label: 'Studio' },
  { href: '/feed', label: 'Feed' },
  { href: '/gigs', label: 'Gigs' },
] as const;

export function LandingNav() {
  const { user, loading } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border-subtle bg-canvas/90 backdrop-blur-xl'
          : 'bg-gradient-to-b from-canvas/80 to-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-lime font-display text-sm font-bold text-[#14151a] transition group-hover:shadow-lime-sm">
            S
          </div>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-ink">
            Synthetica
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn-ghost !px-3 !py-1.5 !text-[10px] sm:!text-xs"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading &&
            (user ? (
              <Link href="/dashboard" className="btn-lime !px-4 !py-2 !text-xs">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost hidden !text-xs sm:inline-flex">
                  Sign in
                </Link>
                <Link href="/explore" className="btn-lime !px-4 !py-2 !text-xs">
                  Enter
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
