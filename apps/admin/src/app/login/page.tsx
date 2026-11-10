"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { ready, user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("rose.glow.bd@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted">
          Rose Glow Admin
        </p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-night p-12 text-cream lg:flex">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-rose">
            Rose Glow
          </p>
          <h1 className="mt-6 max-w-md font-display text-5xl leading-[1.05]">
            Quiet operations for a luminous catalogue.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/70">
            Manage orders, product stories, and storefront content from the
            atelier console — composed in the same editorial palette as the
            shop.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40">
          Admin · Port 3002
        </p>
        <div className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-rose/15 blur-3xl" />
      </div>
      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-[10px] uppercase tracking-[0.28em] text-rose lg:hidden">
            Rose Glow Admin
          </p>
          <h2 className="mt-3 font-display text-3xl text-night">Sign in</h2>
          <p className="mt-2 text-sm text-muted">
            Use your staff credentials to enter the dashboard.
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label="Email">
              <input
                type="email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
            {error ? (
              <p className="border border-red-800/20 bg-red-50 px-3 py-2 text-sm text-red-900">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" loading={loading}>
              Enter atelier
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      {children}
    </label>
  );
}
