'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <p className="mt-1 text-sm text-white/50">
        Demo account: buyer@synthetica.dev / demo1234
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-4 py-2.5 text-sm text-white outline-none focus:border-neon-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-4 py-2.5 text-sm text-white outline-none focus:border-neon-400"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-neon-500 py-2.5 text-sm font-semibold text-white hover:bg-neon-400 disabled:opacity-50"
        >
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
        className="mt-3 w-full rounded-full border border-white/15 py-2.5 text-sm text-white/80 hover:border-white/30"
      >
        Continue with Google (stub)
      </button>

      <p className="mt-6 text-center text-sm text-white/50">
        No account?{' '}
        <Link href="/register" className="text-neon-300 hover:text-neon-200">
          Register
        </Link>
      </p>
    </div>
  );
}
