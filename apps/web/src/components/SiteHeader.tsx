'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

export function SiteHeader({ total }: { total?: number }) {
  const { user, loading } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-500 to-accent font-bold text-white">
            S
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Synthetica</p>
            <p className="text-[10px] uppercase tracking-wider text-white/40">AI Character Market</p>
          </div>
        </Link>

        <div className="flex-1" />

        {typeof total === 'number' && (
          <span className="hidden text-xs text-white/40 sm:block">{total} characters</span>
        )}

        {!loading && (
          <>
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-full border border-neon-500/30 bg-neon-500/10 px-4 py-1.5 text-sm text-neon-200 hover:bg-neon-500/20"
              >
                {user.displayName}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/80 hover:border-white/30"
              >
                Sign in
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
