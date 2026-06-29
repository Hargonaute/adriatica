'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth/auth-client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn.email(
      { email, password, callbackURL: callbackUrl },
      {
        onSuccess: () => {
          router.push(callbackUrl);
          router.refresh();
        },
        onError: (ctx) => {
          setError(ctx.error.message ?? 'Invalid credentials.');
          setLoading(false);
        },
      }
    );

    if (!result) {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="admin@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-foreground py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default function DashboardLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/10 p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">CMS Dashboard</p>
        </div>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-md bg-muted" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
