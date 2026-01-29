'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabaseClient from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If already authenticated, redirect to home or redirectedFrom
    let mounted = true;
    async function check() {
      try {
        const res = await fetch('/api/auth/me');
        if (!mounted) return;
        if (res.ok) {
          const redirect = searchParams.get('redirectedFrom') || '/';
          router.replace(redirect);
        }
      } catch (err) {
        // ignore
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await supabaseClient.auth.signInWithPassword({ email, password });
      if (res.error || !res.data.session) {
        setError(res.error?.message || 'Failed to sign in');
        setLoading(false);
        return;
      }

      const token = res.data.session.access_token;
      // set httpOnly cookie on server
      const r = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token }),
      });

      if (!r.ok) {
        const body = await r.json();
        setError(body?.error || 'Failed to set session');
        setLoading(false);
        return;
      }

      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-card rounded-lg shadow-lg overflow-hidden">
        {/* Left - info */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="w-24 h-24 rounded-md bg-primary/10 flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-primary">UR</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Welcome back</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Нэвтрэхээр бүртгэлтэй хэрэглэгчийн тохиргоо, тайлан, болон удирдлагын самбар руу
            нэвтэрнэ үү.
          </p>
        </div>

        {/* Right - form */}
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-2 text-foreground">Нэвтрэх</h2>
          <p className="text-sm text-muted-foreground mb-6">Имэйл болон нууц үгээр нэвтэрнэ үү</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground">Нууц үг</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 input"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" className="checkbox" />
                <span className="text-sm text-muted-foreground">Намайг санах</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Нууц үгээ мартсан
              </a>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full btn btn-primary flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                ) : null}
                <span>{loading ? 'Түр хүлээнэ үү...' : 'Нэвтрэх'}</span>
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Эсвэл{' '}
              <a href="#" className="text-primary hover:underline">
                Тусламж
              </a>
              -тай холбогдоно уу
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
