'use client';

import { formatMoney, MIN_TOP_UP_MINOR, type CharacterDetailDTO, type LicenseTierDTO } from '@acm/shared';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ordersApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

type Step = 'idle' | 'auth' | 'topup' | 'confirm' | 'success' | 'error';

export function CheckoutPanel({
  character,
}: {
  character: CharacterDetailDTO;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<Step>('idle');
  const [tier, setTier] = useState<LicenseTierDTO | null>(null);
  const [balanceMinor, setBalanceMinor] = useState<number | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ serial: string; orderId: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function startBuy(t: LicenseTierDTO) {
    setTier(t);
    setError('');
    if (!user) {
      setStep('auth');
      return;
    }
    await proceedCheckout(t);
  }

  async function proceedCheckout(t: LicenseTierDTO) {
    setLoading(true);
    try {
      const bal = await walletApi.balance();
      setBalanceMinor(bal.balance.amountMinor);
      if (bal.balance.amountMinor < t.priceMinor) {
        setTopUpAmount(Math.max(MIN_TOP_UP_MINOR, t.priceMinor));
        setStep('topup');
        return;
      }
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not check balance');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }

  async function handleTopUp() {
    if (!tier) return;
    setLoading(true);
    setError('');
    try {
      await walletApi.topUp(topUpAmount);
      const bal = await walletApi.balance();
      setBalanceMinor(bal.balance.amountMinor);
      if (bal.balance.amountMinor < tier.priceMinor) {
        setError('Top-up succeeded but balance is still insufficient.');
        return;
      }
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Top-up failed');
    } finally {
      setLoading(false);
    }
  }

  async function confirmPurchase() {
    if (!tier) return;
    setLoading(true);
    setError('');
    try {
      const order = await ordersApi.purchase(character.slug, tier.id);
      setResult({ serial: order.certificate.serial, orderId: order.orderId });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setStep('idle');
    setTier(null);
    setError('');
    setResult(null);
  }

  return (
    <>
      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
          License tiers
        </h2>
        {character.licenseTiers.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-xl card-surface p-4"
          >
            <div>
              <p className="font-semibold text-white">
                {t.name}
                {t.exclusive && (
                  <span className="ml-2 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] uppercase text-rose-300">
                    exclusive
                  </span>
                )}
              </p>
              <p className="text-xs text-white/50">{t.description}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-neon-300">
                {formatMoney(t.priceMinor, t.currency)}
              </p>
              <button
                onClick={() => startBuy(t)}
                disabled={loading}
                className="mt-1 rounded-full bg-neon-500 px-4 py-1 text-xs font-semibold text-white hover:bg-neon-400 disabled:opacity-50"
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {step !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.95, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl"
            >
              {step === 'auth' && (
                <>
                  <h3 className="text-lg font-semibold text-white">Sign in to purchase</h3>
                  <p className="mt-1 text-sm text-white/50">
                    You need an account to license {character.name}.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/login?next=/character/${character.slug}`}
                      className="flex-1 rounded-full bg-neon-500 py-2 text-center text-sm font-semibold text-white"
                    >
                      Sign in
                    </Link>
                    <Link
                      href={`/register?next=/character/${character.slug}`}
                      className="flex-1 rounded-full border border-white/15 py-2 text-center text-sm text-white/80"
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}

              {step === 'topup' && tier && (
                <>
                  <h3 className="text-lg font-semibold text-white">Top up wallet</h3>
                  <p className="mt-1 text-sm text-white/50">
                    Balance: {formatMoney(balanceMinor ?? 0)} — need{' '}
                    {formatMoney(tier.priceMinor, tier.currency)} for {tier.name}.
                  </p>
                  <label className="mt-4 block text-xs text-white/40">Top-up amount (USD)</label>
                  <input
                    type="number"
                    min={MIN_TOP_UP_MINOR / 100}
                    step={1}
                    value={topUpAmount / 100}
                    onChange={(e) => setTopUpAmount(Math.round(Number(e.target.value) * 100))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-white"
                  />
                  {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
                  <button
                    onClick={handleTopUp}
                    disabled={loading || topUpAmount < MIN_TOP_UP_MINOR}
                    className="mt-4 w-full rounded-full bg-neon-500 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {loading ? 'Processing…' : `Top up ${formatMoney(topUpAmount)}`}
                  </button>
                </>
              )}

              {step === 'confirm' && tier && (
                <>
                  <h3 className="text-lg font-semibold text-white">Confirm purchase</h3>
                  <p className="mt-2 text-sm text-white/70">
                    {character.name} — {tier.name}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-neon-300">
                    {formatMoney(tier.priceMinor, tier.currency)}
                  </p>
                  <p className="text-xs text-white/40">
                    Wallet balance: {formatMoney(balanceMinor ?? 0)}
                  </p>
                  {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
                  <button
                    onClick={confirmPurchase}
                    disabled={loading}
                    className="mt-4 w-full rounded-full bg-neon-500 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {loading ? 'Processing…' : 'Confirm & pay from wallet'}
                  </button>
                </>
              )}

              {step === 'success' && result && (
                <>
                  <h3 className="text-lg font-semibold text-emerald-400">License purchased!</h3>
                  <p className="mt-2 text-sm text-white/70">
                    Certificate: <span className="font-mono text-neon-200">{result.serial}</span>
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Locked assets are available in your dashboard via signed download links.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-4 w-full rounded-full bg-neon-500 py-2 text-sm font-semibold text-white"
                  >
                    Go to dashboard
                  </button>
                </>
              )}

              {step === 'error' && (
                <>
                  <h3 className="text-lg font-semibold text-rose-400">Something went wrong</h3>
                  <p className="mt-2 text-sm text-white/60">{error}</p>
                  <button
                    onClick={close}
                    className="mt-4 w-full rounded-full border border-white/15 py-2 text-sm text-white/80"
                  >
                    Close
                  </button>
                </>
              )}

              {step !== 'success' && step !== 'error' && (
                <button
                  onClick={close}
                  className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/60"
                >
                  Cancel
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
