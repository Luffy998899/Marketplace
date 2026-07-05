'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const [email, setEmail] = useState('buyer@synthetica.dev');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <span className="badge-lime mb-4 w-fit">Buyer access</span>
        <h1 className="heading-display text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Demo buyer: buyer@synthetica.dev / demo1234
          <br />
          Demo creator: creator@synthetica.dev / demo1234
          <br />
          Demo admin: admin@synthetica.dev / demo1234
          <br />
          Demo freelancer: freelancer@synthetica.dev / demo1234
        </p>

        <form onSubmit={onSubmit} className="card-surface mt-8 space-y-4 p-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="input-field"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="input-field"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-lime w-full disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              await googleLogin();
              router.push('/dashboard');
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Google sign-in failed');
            } finally {
              setLoading(false);
            }
          }}
          className="btn-ghost mt-3 w-full"
        >
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-ink-dim">
          No account?{' '}
          <Link href="/register" className="font-semibold text-lime hover:underline">
            Register
          </Link>
        </p>
      </div>
    </>
  );
}
