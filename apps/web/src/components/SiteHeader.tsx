'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

export function SiteHeader() {
  const { user, loading } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-lime font-display text-sm font-bold text-[#14151a]">
            S
          </div>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-ink">
            Synthetica
          </span>
        </Link>
        {!loading &&
          (user ? (
            <div className="flex items-center gap-2">
              {(user.role === 'CREATOR' || user.role === 'ADMIN') && (
                <Link href="/studio" className="btn-ghost !px-3 !py-1.5 !text-[10px] sm:!text-xs">
                  Studio
                </Link>
              )}
              <Link href="/dashboard" className="btn-lime !px-4 !py-2 !text-xs">
                Dashboard
              </Link>
            </div>
          ) : (
            <Link href="/login" className="btn-ghost !px-4 !py-2 !text-xs">
              Sign in
            </Link>
          ))}
      </div>
    </header>
  );
}
