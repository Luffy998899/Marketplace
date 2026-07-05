import Link from 'next/link';

/** Higgsfield-style inverted footer — lime band anchors the page. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border-subtle bg-lime text-[#14151a]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-display">Synthetica</p>
          <p className="mt-1 max-w-sm text-sm font-medium opacity-70">
            The world&apos;s first marketplace for fully synthetic AI characters. License, trade,
            own.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm font-semibold uppercase tracking-label">
          <Link href="/" className="opacity-80 hover:opacity-100">
            Explore
          </Link>
          <Link href="/dashboard" className="opacity-80 hover:opacity-100">
            Dashboard
          </Link>
          <Link href="/login" className="opacity-80 hover:opacity-100">
            Sign in
          </Link>
        </div>
      </div>
      <div className="border-t border-black/10 px-4 py-3 text-center text-[11px] font-medium uppercase tracking-label opacity-60 sm:px-6">
        © {new Date().getFullYear()} Synthetica · 100% synthetic · No real-person likeness
      </div>
    </footer>
  );
}
