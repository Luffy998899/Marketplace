'use client';

import { formatMoney } from '@acm/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { assetsApi, ordersApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface OrderRow {
  orderId: string;
  characterSlug: string;
  characterName: string;
  licenseType: string;
  amountMinor: number;
  currency: string;
  certificate: { serial: string; issuedAt: string; ledgerHash: string };
  purchasedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuthStore();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState<
    Record<string, Array<{ url: string; label: string; expiresAt: string }>>
  >({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?next=/dashboard');
      return;
    }
    void load();
  }, [user, authLoading, router]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [ords, bal] = await Promise.all([ordersApi.mine(), walletApi.balance()]);
      setOrders(ords);
      setBalance(bal.balance.amountMinor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function fetchDownloads(slug: string) {
    try {
      const links = await assetsApi.downloads(slug);
      setDownloads((d) => ({
        ...d,
        [slug]: links.map((l) => ({ url: l.url, label: l.label, expiresAt: l.expiresAt })),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not get download links');
    }
  }

  if (authLoading || (!user && loading)) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-ink-dim">Loading…</div>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="badge-lime mb-3">Your vault</span>
            <h1 className="heading-display text-3xl font-bold sm:text-4xl">Dashboard</h1>
            <p className="mt-1 text-sm text-ink-secondary">{user?.displayName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="card-surface px-4 py-2 font-display text-sm font-bold text-lime">
              {formatMoney(balance ?? 0)}
            </span>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="btn-ghost !px-3 !py-2 !text-xs"
            >
              Sign out
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-ink">
              Creator Studio
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              List synthetic characters and earn on every license sold.
            </p>
          </div>
          <Link
            href={user?.role === 'CREATOR' || user?.role === 'ADMIN' ? '/studio' : '/studio/become-creator'}
            className="btn-lime shrink-0 !text-xs"
          >
            {user?.role === 'CREATOR' || user?.role === 'ADMIN' ? 'Open studio' : 'Become a creator'}
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-[10px] font-bold uppercase tracking-label text-ink-dim">
            Licenses · {orders.length}
          </h2>

          {loading ? (
            <p className="mt-6 text-ink-dim">Loading…</p>
          ) : orders.length === 0 ? (
            <div className="card-surface mt-4 border-dashed p-12 text-center">
              <p className="text-ink-secondary">No licenses yet.</p>
              <Link href="/" className="btn-lime mt-4 inline-block !text-xs">
                Explore characters
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {orders.map((o) => (
                <div key={o.orderId} className="card-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/character/${o.characterSlug}`}
                        className="font-display text-lg font-bold uppercase tracking-wide text-ink hover:text-lime"
                      >
                        {o.characterName}
                      </Link>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-label text-ink-dim">
                        {o.licenseType.replace('_', ' ')} · {formatMoney(o.amountMinor, o.currency)}{' '}
                        · {new Date(o.purchasedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-semibold text-lime">{o.certificate.serial}</p>
                      <Link
                        href={`/verify/${o.certificate.serial}`}
                        className="text-[10px] font-semibold uppercase tracking-label text-ink-dim hover:text-lime"
                      >
                        Verify certificate
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border-subtle pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-label text-ink-dim">
                      Locked assets
                    </p>
                    {downloads[o.characterSlug] ? (
                      <ul className="mt-2 space-y-1.5">
                        {downloads[o.characterSlug]!.map((d) => (
                          <li key={d.url}>
                            <a
                              href={d.url}
                              className="text-sm font-medium text-lime hover:underline"
                              download
                            >
                              ↓ {d.label}
                            </a>
                            <span className="ml-2 text-[10px] text-ink-dim">
                              exp {new Date(d.expiresAt).toLocaleTimeString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <button
                        onClick={() => fetchDownloads(o.characterSlug)}
                        className="btn-ghost mt-2 !px-3 !py-1.5 !text-[10px]"
                      >
                        Get download links
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
